import ax from './axios'

export default {
  get: async (params) => {
    const data = new URLSearchParams()

    data.append('pagination', params.page)
    data.append('city', params.city)
    try {
      const response = await ax.getAllPosts(data)

      return response
    } catch (error) {
    }
  },
  add: (data) => {
    const { title, text, city, id } = data
    const params = new FormData()

    params.append('vkId', id)
    params.append('title', title)
    params.append('text', text)
    params.append('city', city ? city.id : 2)
    for (let i = 0; i < data.files.length; i++) {
      params.append(`file${i + 1}`, data.files[i])
    }
      const response = ax.sendNewPost(params)
      return response
  },
  delete: async (data) => {
    const { postId, id } = data
    const params = new URLSearchParams()

    params.append('vkId', id)
    params.append('id', postId)

    try {
      const response = await ax.deletePosts(params)

      return response
    } catch (error) {
    }
  }
}
