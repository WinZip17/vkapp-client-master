import ax from 'axios'

const get = async (id, setMasterServices) => {
  let validate = true

  if (typeof id !== 'number') validate = false

  if (validate) {
    const params = new URLSearchParams()

    params.append('id', id)

    try {
      const response = await ax.masterServicesGet(params)

      if (Array.isArray(response.data)) {
        console.log('setMasterServices', response.data)
        setMasterServices(response.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export default {
  get
}
