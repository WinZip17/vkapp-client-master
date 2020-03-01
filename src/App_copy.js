import React, { Component } from 'react'
import { Route, Redirect, Link } from 'react-router-dom'
import {
  platform,
  IOS,
  Root,
  View,
  Panel,
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  Alert,
  Div,
  Input,
  List,
  Cell,
  Epic,
  Tabbar,
  TabbarItem
} from '@vkontakte/vkui'
import ScreenOne from "./components/screen-1/screen-one"
import ScreenTwo from "./components/screen-2/screen-two"
import ScreenThree from "./components/screen-3/screen-three"
import ScreenFour from "./components/screen-4/screen-four"
import FeedView from "./components/feed-view/feed-view"
import loading from "./components/loading/loading"
import ScreenRules from "./components/screen-rules/screen-rules"
import API from './API/API'
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon28Search from '@vkontakte/icons/dist/28/search';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Users from '@vkontakte/icons/dist/28/users';


const osname = platform()

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nameCites: [],
      currentCity: {},
      activeModal: null,
      modalHistory: [],
      online: true,
      activePanel: '/feed',
      activePanelRegister: '/screen-rules',
      activeStory: 'feed',
      storyHistory: '/',
      fetchedUser: null,
      customerTypes: null,
      customerServices: null,
      mastersCount: 0,
      masters: null,
      master: null,
      searchFilterRadius: API.searchFilters.radius,
      searchFilterSortType: API.searchFilters.sortType,
      searchFilterSortType2: API.searchFilters.sortType2,
      currentTab: 1,
      tab1scroll: 0,
      regs: true,
      popout: null,
      priceFrom: null,
      priceTo: null,
    }
    this.setCites = this.setCites.bind(this);
    this.setCity = this.setCity.bind(this);
    this.onStoryChange = this.onStoryChange.bind(this);
    this.modalBack = () => {
      this.setState({ activeModal: null })
    };
  }
  setActiveModal(activeModal) {
    activeModal = activeModal || null;
    let modalHistory = this.state.modalHistory ? [...this.state.modalHistory] : [];

    if (activeModal === null) {
        modalHistory = [];
    } else if (modalHistory.includes(activeModal)) {
        modalHistory = modalHistory.splice(0, modalHistory.indexOf(activeModal) + 1);
    } else {
        modalHistory.push(activeModal);
    }

    this.updateModal(activeModal, modalHistory);
};
  setPriceFrom = value => this.setState({ priceFrom: value })
  setPriceTo = value => this.setState({ priceTo: value })
  setPopout = popout => this.setState({ popout: popout })
  setAlert = (title, body, link = '') => {

    const popout = <Alert
        actionsLayout='vertical'
        onClose={() => { this.setState({ popout: null})}}
        >
          <h2>{title}</h2>
          <p>{body}</p>
          {link}
        </Alert>
    this.setState({ popout })
  }
  toggleTabs = newTab => this.setState({ currentTab: newTab })
  setTab1scroll = newTab => this.setState({ tab1scroll: newTab })
  regs = () => this.setState({ regs: false })
  setFetchedUser = (fetchedUserData) => this.setState({ fetchedUser: fetchedUserData })
  setCoordinates = (coordinates) => {
    if (coordinates.hasOwnProperty('lat')) {
      let user = { ...this.state.fetchedUser }
      user.coordinates = { lat: coordinates.lat, lng: coordinates.long }
      this.setFetchedUser(user)

      API.masters.get(
        { customer_service_id: this.state.customerServices.selected_option.id },
        this.setMasters,
        this.setMastersCount,
        user
      )
    }
  }


  setCustomerTypes = (preparedSelect) => {
    this.setState({ customerTypes: preparedSelect })

    this.setMasters(null)
    this.setMastersCount(0)

    API.customerServices.get(
      preparedSelect.selected_option.id,
      this.setCustomerServices,
      null
    )
  }

  setCustomerServices = (preparedSelect) => {
    this.setState({ customerServices: preparedSelect })

    API.masters.get(
      { customer_service_id: preparedSelect.selected_option.id },
      this.setMasters,
      this.setMastersCount,
      this.state.fetchedUser
    )

  }

  setSearchFilterRadius = (preparedSelect) => {
    this.setState({ searchFilterRadius: preparedSelect })
  }

  setSearchFilterSortType = (preparedSelect) => {
    this.setState({ searchFilterSortType: preparedSelect })
  }

  setSearchFilterSortType2 = (preparedSelect) => {
    this.setState({ searchFilterSortType2: preparedSelect })
  }

  setMastersCount = (count) => {
    this.setState({ mastersCount: count })
  }

  setMasters = (masters) => {
    this.setState({ masters: masters })
  }

  setMaster = (master) => {
    this.setState({ master: master })
  }

  setMasterServices = (masterServices) => {
    let master = { ...this.state.master }
    master.masterServices = masterServices
    this.setMaster(master)
  }

  setOnline = (boolean) => {
    this.setState({ online: boolean })
  }
  componentDidMount() {
    // вещаем лисенеры для реагирвоания на отсутсвие инета
    window.addEventListener("offline", () => this.setOnline(false))
    window.addEventListener("online", () => this.setOnline(true))

    // сверяемся с адресом
    if (this.state.activePanel !== window.location.pathname) {
      this.setState({ activePanel: window.location.pathname })
    }

    // Меняем внешний вид статус бара
    API.setViewSettings()

    /**
     * При входе в приложение нужно запросить
     * 1. Данные пользователя
     * 2. "Для кого пользователь ищет мастера"
     */

    API.fetchUser(this.setFetchedUser)
    API.customerTypes.get(this.setCustomerTypes)

    // при нажатии "назад"
    window.onpopstate = () => {
      // подгоняем текущую стр под url
      this.setState({ activePanel: window.location.pathname })


      switch (window.location.pathname) {

        case '/screen-3':

          if (this.state.currentTab === 1) {
            // проматываем страницу до последнего запомненного положения
            document.querySelector('.screen-three').scrollTo({ top: this.state.tab1scroll, behavior: 'instant' })
          }

          // обнуляем вспл окно и данные мастера
          this.setPopout(null)
          this.setMaster(null)

          break

        case '/screen-2':

          if (this.state.customerTypes) {
            // обновляем счетчик мастеров
            this.setMastersCount(this.state.masters.length)
          }

          break

        case '/master':

          // Если this.search есть
          if (this.search) {
            // обнуляем его, все обнуляем
            this.search = null
            window.history.pushState({ foo: "/" }, "/", "/")
            this.setState({ activePanel: "/" })
            this.setPopout(null)
            this.setMaster(null)
          }

          // определяем по ссылке ли был переход
          if (window.location.search.includes("?id")) {
            this.setPopout(null)
          }


          break

        default:
          break

      }
    }
    this.onChange({target : {value: ''}})
  }

  componentDidUpdate (prevProps, prevState, snapshot) {

    // ниже по мере получения данных - запрашиваем следующие данные
    switch (window.location.pathname) {
      case '/':
        if (!this.setFetchedUser) {
          API.fetchUser(this.setFetchedUser)
          API.customerTypes.get(this.setCustomerTypes)
        }

        break

      case '/screen-2':

        if (!this.setFetchedUser && !this.state.customerTypes) {
          API.customerTypes.get(this.setCustomerTypes)

        } else if (!this.state.customerServices && this.state.customerTypes) {

          API.customerServices.get(
            this.state.customerTypes.selected_option.id,
            this.setCustomerServices,
            null)

        }
        break

      case '/screen-3':

        if (this.state.fetchedUser && this.state.regs) {

          API.reg(this.state.fetchedUser.id, `${this.state.fetchedUser.first_name} ${this.state.fetchedUser.last_name}` )
          this.regs()

        } else if (!this.state.customerServices && this.state.customerTypes) {

          API.customerServices.get(
            this.state.customerTypes.selected_option.id,
            this.setCustomerServices,
            null)

        } else if (this.state.customerTypes && this.state.customerServices && !this.state.masters) {

          API.masters.get(
            { customer_service_id: this.state.customerServices.selected_option.id },
            this.setMasters,
            this.setMastersCount,
            this.state.fetchedUser
          )
        }

        break

      case '/master':
        if (!this.state.master && this.state.fetchedUser) {
          if (window.location.search.indexOf('id') !== -1) {
            let id = parseInt(window.location.search.replace(/\D+/g, ""))
            API.masters.get(
              { id: +id },
              this.setMaster,
              null,
              this.state.fetchedUser
            )
          }
        } else if (this.state.master && !this.state.master.hasOwnProperty('masterServices')) {
          API.mastersServices.get(this.state.master[0].vk_id, this.setMasterServices)
        } else if (!this.state.customerServices && this.state.customerTypes) {

          API.customerServices.get(
            this.state.customerTypes.selected_option.id,
            this.setCustomerServices,
            null)

        }
        break
      default:
        break
    }

  }

  // пере
  go = (e, href) => {
    if (e) this.setState({ activePanel: e.currentTarget.dataset.to })
    if (href) {
      window.history.pushState({ foo: "/master" }, "/master", href)
      this.setState({ activePanel: "/master" })
    }
  }

  updateModal = (activeModal, modalHistory) => {
    this.setState({
      activeModal,
      modalHistory
  });
  }

  setCites(city) {
    if(city.response){
      this.setState({ nameCites: city.response.items })
    }
  }

  setCity(city) {
    this.setState({ currentCity: city })
  }

  onChange(e) {
      API.suggestionsVK({
        type: 'city',
        vkToken: '4aedd1ef4aedd1ef4aedd1ef914a8161c644aed4aedd1ef1782edf3e880c00a1413e96e',
        value: e.target.value,
        vkCountryId: 1,
      }, this.setCites)
  }
  onStoryChange = (e) => {
    let storyHistory = this.state.activePanel
    let activePanel = this.state.storyHistory

    if (this.state.activeStory !== e.currentTarget.dataset.story)
      this.setState({ activeStory: e.currentTarget.dataset.story, storyHistory, activePanel })
  }

  render () {
    // if (this.state.activeStory === '/feed' && window.location.pathname !== '/feed' )
    //   this.setState({ activeStory: 'main' })
    // const redir = window.location.pathname === this.state.activePanel ? null : <Redirect to={{ pathname: this.state.activePanel }} />
    const citesList = ( <>
    {this.state.nameCites.length ? (
      <List>
        {this.state.nameCites.map((city, key) => (
          <Cell
            key={key}
            onClick={() => {
                this.setCity(city)
                this.modalBack()
            }}
          >{city.title}{city.region ? ` (${city.region.trim()})` : null}
          </Cell>
        ))}
      </List>
    ) : null}
  </> )

    const modal = this.state.activeModal ? (
      <ModalRoot activeModal={this.state.activeModal}>
          <ModalPage id='filters'
          header={
              <ModalPageHeader
                left={<PanelHeaderButton
                > </PanelHeaderButton
                >}
                right={<PanelHeaderButton
                    onClick={this.modalBack}>Закрыть</PanelHeaderButton
                >}
              >
                Выбрать город
              </ModalPageHeader>
            }
            >
              <Div>
              <Input value={this.state.filter} onChange={(e) => this.onChange(e)}/>
                <>
                  {citesList}
                </>
              </Div>
          </ModalPage>
      </ModalRoot>
    ) : null


    // вот тут мы определяем был ли переход по ссылке или нет
    let hrefIndex = window.location.href.indexOf('#master')
    let search = ''

    if (hrefIndex !== -1 && this.state.activePanel !== "/master") {
      search = window.location.href.substr(hrefIndex + 7)
      if (search.includes('%3F')) {
        search = search.replace('%3F', '?')
      }

      // запоминаем поиск
      this.search = search
      this.setState({ activePanel: "/master" })
    }

    if (!this.state.online) {
      return loading("disconnected")
    }


    // ниже просто вьюшик как в вкашной документации и роуты - маршруты
    return (
      <div className="App">
        {/*{redir}*/}
        <Epic activeStory={this.state.activeStory} tabbar={
        <Tabbar>
          <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'main'}
              data-story="main"
              // text="Поиск"
          ><Icon28Search /></TabbarItem>

          <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'feed'}
              data-story="feed"
              // text="Лента"
            ><Icon28Newsfeed /> </TabbarItem>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'registration'}
              data-story="registration"
              // text="Регистрация"
            ><Icon28Users/> </TabbarItem>

        </Tabbar>
      }>
          <Root id='main' activeView="main">
            <View id="main" activePanel={this.state.activePanel} popout={this.state.popout} modal={modal}>
              <Panel id="/">
                <Route exact path='/'
                       render={props =>
                           hrefIndex && this.state.activePanel === "/master" ?
                               <Redirect
                                   to={{
                                     pathname: `/master`,
                                     search: search,
                                   }}
                                   search={this.search}
                               /> :
                               <ScreenOne
                                   go={this.go}
                                   fetchedUser={this.state.fetchedUser}
                                   customerTypes={this.state.customerTypes}
                                   setCustomerTypes={this.setCustomerTypes}
                                   setCustomerServices={this.setCustomerServices}
                                   setMastersCount={this.setMastersCount}
                               />
                       }
                />
              </Panel>
              <Panel id="/screen-2">
                <Route exact path='/screen-2'
                       render={props =>
                           <ScreenTwo
                               osname={osname}
                               go={this.go}
                               fetchedUser={this.state.fetchedUser}
                               mastersCount={this.state.mastersCount}
                               customerTypes={this.state.customerTypes}
                               customerServices={this.state.customerServices}
                               setCustomerServices={this.setCustomerServices}
                               setMastersCount={this.setMastersCount}
                               setMasters={this.setMasters}
                           />
                       }
                />
              </Panel>
              <Panel id="/screen-3">
                <Route exact path='/screen-3'
                       render={props =>
                           this.state.activePanel === "/master" ? <Redirect to='/master'/> :
                               <ScreenThree
                                   tab1scroll={this.state.tab1scroll}
                                   setTab1scroll={this.setTab1scroll}
                                   osname={osname}
                                   IOS={osname === IOS}
                                   go={this.go}
                                   fetchedUser={this.state.fetchedUser}
                                   customerTypes={this.state.customerTypes}
                                   customerServices={this.state.customerServices}
                                   setCustomerServices={this.setCustomerServices}
                                   masters={this.state.masters}
                                   mastersCount={this.state.mastersCount}
                                   setMaster={this.setMaster}
                                   setMasters={this.setMasters}
                                   setMastersCount={this.setMastersCount}
                                   searchFilterRadius={this.state.searchFilterRadius}
                                   searchFilterSortType={this.state.searchFilterSortType}
                                   searchFilterSortType2={this.state.searchFilterSortType2}
                                   priceFrom={this.state.priceFrom}
                                   priceTo={this.state.priceTo}
                                   setPriceFrom={this.setPriceFrom}
                                   setPriceTo={this.setPriceTo}
                                   setSearchFilterRadius={this.setSearchFilterRadius}
                                   setSearchFilterSortType={this.setSearchFilterSortType}
                                   setSearchFilterSortType2={this.setSearchFilterSortType2}
                                   currentTab={this.state.currentTab}
                                   toggleTabs={this.toggleTabs}
                                   setAlert={this.setAlert}
                                   setCoordinates={this.setCoordinates}
                                   setActiveModal={this.setActiveModal}
                                   MODAL_PAGE_FILTERS={this.state.MODAL_PAGE_FILTERS}
                                   modalHistory={this.state.modalHistory}
                                   activeModal={this.state.activeModal}
                                   updateModal={this.updateModal}
                                   currentCity={this.state.currentCity}
                               />
                       }
                />
              </Panel>
              <Panel id="/master">
                <Route exact path='/master'
                       render={props =>
                           this.state.activePanel === "/" ?
                               <Redirect
                                   to={{pathname: `/`}}
                               /> :
                               <ScreenFour
                                   go={this.go}
                                   osname={osname}
                                   fetchedUser={this.state.fetchedUser}
                                   customerTypes={this.state.customerTypes}
                                   customerServices={this.state.customerServices}
                                   master={this.state.master}
                                   setMaster={this.setMaster}
                                   setMasters={this.setMasters}
                                   currentTab={this.state.currentTab}
                                   setPopout={this.setPopout}
                                   search={this.search}
                               />
                       }
                />
              </Panel>

            </View>
          </Root>
          <Root id='registration' activeView="registration">
            <View id="registration" activePanel={"/screen-rules"} popout={this.state.popout} modal={modal}>
              <Panel id="/screen-rules">
                <ScreenRules
                    osname={osname}
                    go={this.go}

                />
                {/*<Route exact path='/screen-rules'*/}
                {/*       render={props =>*/}
                {/*           <ScreenRules*/}
                {/*               osname={osname}*/}
                {/*               go={this.go}*/}

                {/*           />*/}
                {/*       }*/}
                {/*/>*/}
              </Panel>
            </View>
          </Root>

          <Root id="feed" activeView="feed">
            <View id="feed" activePanel='/feed' popout={this.state.popout} modal={modal}>

              <Panel id="/feed">
                {/*<Route exact path='/feed'*/}
                {/*       render={props =>*/}
                {/*           this.state.activePanel !== "/feed" ?*/}
                {/*               <Redirect to={this.state.activePanel}/> : this.state.fetchedUser ?*/}
                {/*                : <></>*/}
                {/*       }*/}
                {/*/>*/}
                {this.state.fetchedUser && <FeedView
                    tab1scroll={this.state.tab1scroll}
                    setTab1scroll={this.setTab1scroll}
                    osname={osname}
                    IOS={osname === IOS}
                    go={this.go}
                    fetchedUser={this.state.fetchedUser}
                    customerTypes={this.state.customerTypes}
                    customerServices={this.state.customerServices}
                    setCustomerServices={this.setCustomerServices}
                    masters={this.state.masters}
                    mastersCount={this.state.mastersCount}
                    setMaster={this.setMaster}
                    setMasters={this.setMasters}
                    setMastersCount={this.setMastersCount}
                    searchFilterRadius={this.state.searchFilterRadius}
                    searchFilterSortType={this.state.searchFilterSortType}
                    searchFilterSortType2={this.state.searchFilterSortType2}
                    priceFrom={this.state.priceFrom}
                    priceTo={this.state.priceTo}
                    setPriceFrom={this.setPriceFrom}
                    setPriceTo={this.setPriceTo}
                    setSearchFilterRadius={this.setSearchFilterRadius}
                    setSearchFilterSortType={this.setSearchFilterSortType}
                    setSearchFilterSortType2={this.setSearchFilterSortType2}
                    currentTab={this.state.currentTab}
                    toggleTabs={this.toggleTabs}
                    setAlert={this.setAlert}
                    setCoordinates={this.setCoordinates}
                    setActiveModal={this.setActiveModal}
                    MODAL_PAGE_FILTERS={this.state.MODAL_PAGE_FILTERS}
                    modalHistory={this.state.modalHistory}
                    activeModal={this.state.activeModal}
                    updateModal={this.updateModal}
                    currentCity={this.state.currentCity}
                />}
              </Panel>
            </View>
          </Root>
        </Epic>
      </div>
    )
  }
}

export default App
