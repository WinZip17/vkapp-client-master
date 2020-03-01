import axios from 'axios'

// const { REACT_APP_API_URL } = process.env
const REACT_APP_API_URL = "https://vk.masterimodel.com/node"
const ax = axios.create({ baseURL: REACT_APP_API_URL, headers: { 'Content-Type': 'application/json' } })
const headers = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    PARAM_HEADER: 'eyJ0eXAiOiJKV1QiLC'
  }
}

export default {
  userRegister: (params) => ax.post('/customers.reg', params, headers),
  typesGet: () => ax.get('/customerTypes.get'),
  customerServices: (params) => ax.post('/customerServices.get', params, headers),
  mastersGet: (params) => ax.post('/masters.get', params, headers),
  masterServicesGet: (params) => ax.post('/masterServices.get', params, headers),
  reviewAdd: (params) => ax.post('/review.add', params, headers),
  sendNewPost: (params) => ax.post('/feed.add', params, headers),
  getAllPosts: (params) => ax.get('feed.get', { params }, headers),
  deletePosts: (params) => ax.post('feed.delete', params, headers)
}
