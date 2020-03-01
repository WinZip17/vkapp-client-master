import ax from './axios'
import customerArraysPrepare from '../functions/customerArraysPrepare'

const get = async (callback) => {
  try {
    const response = await ax.typesGet()

    if (Array.isArray(response.data) && response.data.length > 0) {
      callback(customerArraysPrepare(response.data))
    }
  } catch (error) {
    console.log(error)
  }
}

export default { get }
