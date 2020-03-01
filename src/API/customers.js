import ax from './axios'
import API from './API'

const reg = async (id, fullName) => {
  // нужно чтобы в нее добавлять сразу все что нужно передать
  const params = new URLSearchParams()

  // В данном случае это айди: слева наименование - справа значение
  params.append('id', id)
  params.append('full_name', fullName)

  // посылаем данные на url ниже, передаем наши параметры, указываем заголовки
  try {
    const response = await ax.userRegister(params)

    // показать что пришло
    console.log('customers.reg', response)
    if (response.data.role === 'ADMIN') {
      sessionStorage.setItem('role', 'ADMIN');
    }
    // Если пользователь не подписан на сообщество, то запросить чтобы подписался
    if (response.data.hasOwnProperty('isMember')) {
      if (response.data.isMember === 0) {
        API.joinGroup()
      }
    }

    // Если уведомления запрещены, то запросить разрешение на получение уведомлений
    if (response.data.hasOwnProperty('isNotificationsAllowed')) {
      if (response.data.isNotificationsAllowed === 0) {
        API.allowNotifications()
      }
    }

    // если ошибка и пришел статус ее
    if (response.data.hasOwnProperty('status')) {
      // alert(response.data.status)
      console.log(response.data.status)
    }
  } catch (error) {
    console.log(error)
  }
}

export default reg
