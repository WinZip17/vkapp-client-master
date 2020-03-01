import ax from './axios'
import customerArraysPrepare from '../functions/customerArraysPrepare'

const get = async (customerTypeId, setCustomerServices, setMastersCount) => {
  const params = new URLSearchParams()

  params.append('customer_type_id', customerTypeId)

  try {
    const response = await ax.customerServices(params)
    if (response.data.hasOwnProperty('customer_services')) {
      // console.log('3. customer_services', response.data.customer_services)
      setCustomerServices(customerArraysPrepare(response.data.customer_services))
    }
    if (response.data.hasOwnProperty('masters_сount')) {
      if (setMastersCount) {
        setMastersCount(response.data.masters_сount)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  get
}
