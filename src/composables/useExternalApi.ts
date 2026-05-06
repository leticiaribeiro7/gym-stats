import { ref } from 'vue'

// Cache em memória (mantém os dados salvos enquanto a aba não for recarregada)
const apiCache = new Map<string, any>()

export function useExternalApi() {
  const data = ref(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async (queryParam: string) => {
    // 1. Verifica se os dados dessa busca já existem no cache
    if (apiCache.has(queryParam)) {
      data.value = apiCache.get(queryParam)
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_EXERCISEDB_API_KEY,
                'x-rapidapi-host': import.meta.env.VITE_EXERCISEDB_API_HOST,
                'Content-Type': 'application/json'
            }
        };
      
      const url = `${import.meta.env.VITE_EXERCISEDB_API_HOST}/api/v1/exercises?name=${queryParam}&limit=3`;
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 2. Extrai o resultado da API
      const result = await response.json()
      data.value = result.data
      
      // 3. Salva o resultado no cache para consultas futuras
      apiCache.set(queryParam, result)
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred'
    } finally {
      isLoading.value = false
    }
  }

  return {
    data,
    isLoading,
    error,
    fetchData
  }
}