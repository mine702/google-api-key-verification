import fetch from 'node-fetch';

// 타임아웃을 적용한 fetch 함수
async function fetchWithTimeout(resource, options = {}, timeout ) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}

// Google API Discovery 엔드포인트
const DISCOVERY_URL = "https://discovery.googleapis.com/discovery/v1/apis";

export async function checkApiKeyForTitle(apiKey, title) {
    const allowedApis = {
        success: [], // 접근 가능한 API
        fail: []     // 접근할 수 없는 API
    };

    try {
        // Google API 목록 가져오기
        const response = await fetch(DISCOVERY_URL, {});
        if (!response.ok) {
            throw new Error("API 목록을 가져오는 데 실패했습니다.");
        }
        const apiList = await response.json();

        // API 목록에서 주어진 제목(title)과 일치하는 API 검색
        const filteredApi = apiList.items.find(api => api.title.toLowerCase() === title.toLowerCase());

        if (!filteredApi) {
            return { error: `API with title "${title}" not found` };
        }

        const testUrl = `${filteredApi.discoveryRestUrl}&key=${apiKey}`;
        try {
            // 선택된 API에 대한 요청 보내기 (타임아웃 적용)
            const apiResponse = await fetchWithTimeout(testUrl, {}, 5000); // 5초 타임아웃
            if (apiResponse.ok) {
                allowedApis.success.push({ title: filteredApi.title, name: filteredApi.name, id: filteredApi.id }); // 성공 시 success에 추가
            } else {
                allowedApis.fail.push({ title: filteredApi.title, name: filteredApi.name, id: filteredApi.id }); // 실패 시 fail에 추가
            }
        } catch (error) {
            // 오류 발생 시 fail에 추가
            allowedApis.fail.push({ title: filteredApi.title, name: filteredApi.name, id: filteredApi.id });
        }

    } catch (error) {
        return { error: "API 목록을 가져오는 중 문제가 발생했습니다." };
    }

    // 성공과 실패 목록을 반환
    return allowedApis;
}

// API 키를 검증하는 함수 (병렬 처리)
export async function checkApiKey(apiKey) {
    const allowedApis = {
        success: [], // 접근 가능한 API
        fail: []     // 접근할 수 없는 API
    };

    try {
        // Google API 목록 가져오기
        const response = await fetch(DISCOVERY_URL, {});
        if (!response.ok) {
            throw new Error("API 목록을 가져오는 데 실패했습니다.");
        }
        const apiList = await response.json();

        // 병렬 요청을 위한 배열 생성
        const apiPromises = apiList.items.map(async (api) => {
            const testUrl = `${api.discoveryRestUrl}&key=${apiKey}`;
            try {
                // 각 API에 비동기로 요청 보내기 (타임아웃 적용)
                const apiResponse = await fetchWithTimeout(testUrl, {}, 5000); // 1초 타임아웃

                if (apiResponse.ok) {
                    allowedApis.success.push({ title: api.title, name: api.name, id: api.id }); // 접근 가능한 API를 success에 추가
                } else {
                    allowedApis.fail.push({ title: api.title, name: api.name, id: api.id }); // 접근 불가능한 API를 fail에 추가
                }
            } catch (error) {
                // 오류가 발생한 API를 fail에 추가
                allowedApis.fail.push({ title: api.title, name: api.name, id: api.id });
            }
        });

        // 병렬로 모든 API 요청 처리
        await Promise.all(apiPromises);

    } catch (error) {
        // 전체 API 목록 가져오기 실패 시 전체 실패 처리
        return { success: [], fail: [{ error: "API 목록을 가져오는 중 문제가 발생했습니다." }] };
    }

    // 성공과 실패 목록을 JSON으로 반환
    return allowedApis;
}
