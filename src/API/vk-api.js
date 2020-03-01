import bridge from '@vkontakte/vk-bridge';
// Заглушка
import getFakeData from './fake-data';
import { Util } from 'leaflet';
/**
 *  Подписка на ответы ВК
 */
const MODAL_SUGGESTIONS_GETTING = 'MODAL_SUGGESTIONS_GETTING'
const MODAL_SUGGESTIONS_GETTING_SUCCESS = 'MODAL_SUGGESTIONS_GETTING_SUCCESS'
const MODAL_SUGGESTIONS_GETTING_FAILURE = 'MODAL_SUGGESTIONS_GETTING_FAILURE'

export const APP_MODAL_OPENING_SUCCESS = 'APP_MODAL_OPENING_SUCCESS'
 const findSuggestions = ({
    type,
    value,
    vkToken
  }, callback) => {
    switch (type) {
      case 'city':
        subscribe(callback, 'VKWebAppCallAPIMethodResult', 'VKWebAppCallAPIMethodFailed')
        // connect.send('VKWebAppCallAPIMethod', {
        //     method: 'database.getCities',
        //     params: {
        //       country_id: 1,
        //       q: value,
        //       need_all: 0,
        //       count: 1000,
        //       v: '5.103',
        //       lang: 'ru',
        //       access_token: vkToken
        //     }
        //   })
      default:
        return Promise.resolve([])
    }
  }

function subscribe (callback, type, err) {
    // Заглушка ---------------------------------------------------------------------
    // if (type === 'VKWebAppGetUserInfoResult')  {
    //     console.log('1. fetchedUser', getFakeData.fetchedUserOk.data);
    //      callback(getFakeData.fetchedUserOk.data);
    // }

    if (err === 'VKWebAppGeodataFailed') {
        // callback(getFakeData.coordinatesOk.data);
         callback ({
            "lat": "55.75",
            "long": "37.6167"
            // "lat": "55.043801106859036",
            // "long": "82.95130920829251"
        })
    }
    // Заглушка ---------------------------------------------------------------------

    // тут я ловлю события и отправляю соответсвубщие коллбэки
    bridge.subscribe((e) => {
        switch (e.detail.type) {

            case 'VKWebAppGetUserInfoResult':
                if (type === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppGetUserInfoFailed':
                if (err === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppGeodataResult':
                if (type === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppGeodataFailed':
                if (err === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppSetViewSettingsFailed':
                // alert ("VKWebAppSetViewSettingsFailed " + e.detail.data.error_data);
                console.log(e.detail.data.error_data);

                // if (err === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppShareResult':
                // if (type === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppShareFailed':
                // if (err === e.detail.type) callback (e.detail.data);
                break;

            case 'VKWebAppJoinGroupResult':
                // if (type === e.detail.type) API.reg(callback);
                break;

            case 'VKWebAppJoinGroupFailed':
                // if (err === e.detail.type)  API.reg(callback);
                break;

            case 'VKWebAppCallAPIMethodResult':
              // console.log('response', e.detail.data);
              // if (type === e.detail.type) callback (e.detail.data);
                break;
            case 'VKWebAppCallAPIMethodFailed':
                // if (err === e.detail.type)  API.reg(callback);
                if (type === e.detail.type) callback (e.detail.data);
                break;

            default:

        }
    });
}





/**
 * 1. Перехватить данные пользователя
 */

const fetchUser = (callback) => {
    // вызвать подписку, передать полуенный коллбэк и типы в случае результата и ошибки ниже суть такая же
    subscribe(callback, 'VKWebAppGetUserInfoResult', 'VKWebAppGetUserInfoFailed');
    bridge.send('VKWebAppGetUserInfo', {});
};

/**
 * 2. Перехватить данные местоположения пользователя
 */

const fetchUserCoordinates = (callback) => {
    subscribe(callback, 'VKWebAppGeodataResult', 'VKWebAppGeodataFailed');
    bridge.send("VKWebAppGetGeodata", {});
};

/**
 * 3. Установить статус бар в нужный цвет
 */

const setViewSettings = (callback) => {
    subscribe(callback, '', 'VKWebAppSetViewSettingsFailed');
    bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#F5908E"});
};

/**
 * 4. Установить статус бар в нужный цвет
 */

const share = (idMaster) => {
    subscribe(console.log, 'VKWebAppShareResult', 'VKWebAppShareFailed');
    bridge.send("VKWebAppShare", {"link": `https://vk.com/app6967349#master?id${idMaster}`});
};


const joinGroup = () => {
    subscribe(console.log, 'VKWebAppJoinGroupResult', 'VKWebAppJoinGroupFailed');
    bridge.send("VKWebAppJoinGroup", {"group_id": 160192690});
};


const allowNotifications = () => {
    bridge.send("VKWebAppAllowNotifications", {});
};

export const getModalSuggestions = ({
    type,
    id,
    sex,
    value,
    countryId,
    excludedChips
  }) => (dispatch, getState) => {
    // const state = getState();
    // const vkToken = getState().app.vkAppToken
    // console.log('state',state.app.vkAppToken)
    // dispatch({ type: MODAL_SUGGESTIONS_GETTING })

    findSuggestions({
      sex,
      type,
      value,
    //   vkToken,
      countryId,
      excludedChips
    })
      .then((list) => {
       console.log('asdasdasd', list);
      })
      .catch((error) => {
          console.log('errrrr',error );

        dispatch({ type: MODAL_SUGGESTIONS_GETTING_FAILURE, payload: error.message })
      })
  }
  export const appModalOpen = ({ id, data }) => (dispatch, getState) => {
    dispatch({
      type: APP_MODAL_OPENING_SUCCESS,
      payload: {
        viewId: getState().router.route.name.split('/').shift(),
        id,
        data
      }
    })
  }


export default {
    fetchUser,
    fetchUserCoordinates,
    setViewSettings,
    share,
    joinGroup,
    allowNotifications,
    getModalSuggestions,
    findSuggestions
}
