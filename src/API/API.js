/*
 * Этот файл просто как сборщик, в него импортируются другие файлы и экспортируются уже из него
 */

import customerTypes from './customerTypes'
import customerServices from './customerServices'
import masters from './masters'
import mastersServices from './masterServices'
import review from './review'
import SearchFilters from './search-filters'
import vkAPI from './vk-api'
import customers from './customers'
import encoding from './encoding'
import feed from './feed'

export default {
  customerTypes: customerTypes,
  customerServices: customerServices,
  masters: masters,
  mastersServices: mastersServices,
  review: review,
  searchFilters: SearchFilters,
  fetchUser: vkAPI.fetchUser,
  fetchUserCoordinates: vkAPI.fetchUserCoordinates,
  setViewSettings: vkAPI.setViewSettings,
  share: vkAPI.share,
  joinGroup: vkAPI.joinGroup,
  reg: customers,
  allowNotifications: vkAPI.allowNotifications,
  encoding: encoding,
  feed: feed,
  suggestionsVK: vkAPI.findSuggestions
}
