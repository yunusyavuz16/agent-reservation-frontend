import { create } from 'zustand'
import api from '../utils/api'
import { Resource } from '../types'

interface ResourceState {
  resources: Resource[]
  selectedResource: Resource | null
  loading: boolean
  error: string | null
  fetchResources: () => Promise<void>
  fetchResourceById: (id: number) => Promise<void>
  filterResources: (searchTerm: string, category: string) => Resource[]
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  selectedResource: null,
  loading: false,
  error: null,

  fetchResources: async () => {
    set({ loading: true, error: null })

    try {
      const response = await api.get('/Resource')
      set({ resources: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch resources'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchResourceById: async (id: number) => {
    set({ loading: true, error: null, selectedResource: null })

    try {
      const response = await api.get(`/Resource/${id}`)
      set({ selectedResource: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch resource'

      set({ loading: false, error: errorMessage })
    }
  },

  filterResources: (searchTerm: string, category: string) => {
    const { resources } = get()

    return resources.filter(resource => {
      const matchesSearch = searchTerm === '' ||
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = category === '' || resource.category === category

      return matchesSearch && matchesCategory
    })
  }
}))