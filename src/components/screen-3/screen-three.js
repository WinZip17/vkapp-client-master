import React, { Component } from 'react';
import { Link } from "react-router-dom";

import './screen-three.css';

// import HeaderNavigation from "../header-navigation/header-navigation";
import Button from "../button/button";
import Header from "../header/header";
import Filter from "../filter/filter";
import Feed from "../feed/Feed";
import ModalFeed from "../feed/FeedModal";
import Post from "../post/post";
import Map from "../leaflet-map/leaflet-map";
import API from "../../API/API";
import getDistance from "../../functions/getDistance";
import loading from "../loading/loading";

import { PanelHeader } from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";

class ScreenThree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentRadius: 1000,
      list: 1,
      map: 2,
      zoom: 14,
      posts: [],
      priceFrom: this.props.priceFrom,
      priceTo: this.props.priceTo,
      modal: false,
      page: 0,
      hasMore: true,
      currentCity: null,
      feedParams: {}
    };
    this.addPosts = this.addPosts.bind(this)
  }

  setPriceFrom = (e) => {
    this.setState({ priceFrom: e.target.value });
    this.props.setPriceFrom(e.target.value);
  }
  setPriceTo = (e) => {
    this.setState({ priceTo: e.target.value });
    this.props.setPriceTo(e.target.value);
  }
  setZoom = (zoom) => this.setState({ zoom: zoom });

  price = (a, b) => {
    if (a.price < b.price) return -1;
    if (a.price > b.price) return 1;
    return 0;
  };

  stars = (a, b) => {
    if (a.stars_number < b.stars_number) return 1;
    if (a.stars_number > b.stars_number) return -1;
    return 0;
  };


  coordinates = (a, b) => {
    // let deltaLatA = this.props.fetchedUser.coordinates.lat - a.coordinates.lat;
    // let deltaLatB = this.props.fetchedUser.coordinates.lat - b.coordinates.lat;
    //
    // let deltaLngA = this.props.fetchedUser.coordinates.lng - a.coordinates.lng;
    // let deltaLngB = this.props.fetchedUser.coordinates.lng - b.coordinates.lng;

    let radiusA = getDistance(
      [this.props.fetchedUser.coordinates.lat, this.props.fetchedUser.coordinates.lng],
      [a.coordinates.lat, a.coordinates.lng]);

    let radiusB = getDistance(
      [this.props.fetchedUser.coordinates.lat, this.props.fetchedUser.coordinates.lng],
      [b.coordinates.lat, b.coordinates.lng]);

    if (radiusA < radiusB) return -1;
    if (radiusA > radiusB) return 1;

    return 0;
  };

  toggleScroll = () => {
    if (this.props.currentTab === 2) {
      if (this.screenThree.scrollTop < 100) {
        this.screenThree.scrollTo({ top: window.outerHeight, behavior: 'smooth' });
      }
      else
        if (100 <= this.screenThree.scrollTop) {
          this.screenThree.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  };

  componentDidMount() {

    const { fetchedUser } = this.props
    this.screenThree = document.querySelector('.screen-three');
    if (this.props.customerServices) {
      window.history.replaceState(
        {
          type: this.props.customerTypes.selected_option.id,
          service: this.props.customerServices.selected_option.id
        },
        "masters",
        `?type=${this.props.customerTypes.selected_option.id}&service=${this.props.customerServices.selected_option.id}`
      );
    }

    API.setViewSettings();
    const feedParams = { city: fetchedUser.city ? fetchedUser.city.id : 2, page: this.state.page }
    API.feed.get(feedParams)
    .then(res => {
      this.setState({ posts: res.data, feedParams });
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { currentCity } = this.props
    const feedParams = { city:  currentCity.id, page: 0 }
    if (feedParams.city && feedParams.city !== this.state.feedParams.city )
    API.feed.get(feedParams)
    .then(res => {
       this.setState({ posts: res.data, feedParams});
    })

    this.screenThree = document.querySelector('.screen-three');
  }

  masterOnClick = (master) => {
    if (this.props.setMaster) {
      this.props.setTab1scroll(this.screenThree.scrollTop);
      API.masters.get({ id: master.vk_id }, this.props.setMaster, null, this.props.fetchedUser);
    }
  };

  addPosts () {
    const { page } = this.state
    const cityId = this.props.currentCity.id ? this.props.currentCity.id : this.props.fetchedUser.city ? this.props.fetchedUser.city.id : 2
    API.feed.get({ city: cityId, page })
      .then(res => {
        if( res.data.length === 0 ) {
          this.setState({ hasMore: false});
        } else {
          this.setState(prevState => ({
            posts: prevState.posts.concat(res.data),
            page: page + 1
          }))
        }
    })
  }

  immediately = (a, b) => {
    if (a.is_immediately < b.is_immediately) return 1;
    if (a.is_immediately > b.is_immediately) return -1;
    return 0;
  };

  onModal = () => {
    this.setState({ modal: !this.state.modal });
  }

  deletePost = (postId) => {
    const { fetchedUser } = this.props
    API.feed.delete({ id: fetchedUser.id, postId})
      .then(res => {
        this.props.setAlert('Успешно', 'Пост удалён')
        document.location.reload()
      })
      .catch(err => {
        this.props.setAlert('Ошибка', 'Попробуйте еще раз')
      })
  }

  sendNewPost = async (data, previewPhotos) => {
    const { fetchedUser } = this.props
    try {
      const res = await API.feed.add({ ...fetchedUser, ...data })
      const newpost =[
      {
        full_name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
        role: "REGULAR",
        id: res.data.insertId,
        title: data.title,
        text: data.text,
        author_id: "",
        date_add: new Date(),
        post_weight: 0,
        previewPhotos,
        city: this.props.fetchedUser.city ? this.props.fetchedUser.city.id : 2
      }]

      this.setState( prevState => ({ modal: true, posts: newpost.concat(prevState.posts) }))
      this.props.setAlert('Успешно', 'Пост отправлен')
    } catch (error) {
      this.props.setAlert('Ошибка', `Попробуйте позже ${error.response.data.status}`)
      this.setState({ error: true})
    }
  }

  render() {

    if (!this.props.customerServices) {
      return loading();
    }
    if (this.props.customerServices && !this.props.masters) {
      return loading();
    }

    let masters = this.props.masters;

    masters = masters.filter(master =>
      this.state.priceFrom <= master.price
      && (+this.state.priceTo > 0 ? master.price <= this.state.priceTo : true)
      && (this.props.fetchedUser && !this.props.fetchedUser.coordinates ? true : master.distance <= this.props.searchFilterRadius.selected_option.radius / 1000)
    );

    if (this.props.masters && this.props.mastersCount !== masters.length) {
      this.props.setMastersCount(masters.length)
    }

    let foundedMasters = '';
    let mastersCount = this.props.mastersCount;

    if (mastersCount || mastersCount === 0) {
      if (mastersCount % 10 === 1 && parseInt(mastersCount / 10) !== 1 && parseInt(mastersCount / 10) % 10 !== 1) {
        foundedMasters = `Найден ${mastersCount} мастер`
      }
      if ((mastersCount < 10 || mastersCount > 20) && 2 <= mastersCount % 10 && mastersCount % 10 <= 4) {
        foundedMasters = `Найдено ${mastersCount} мастера`
      }
      if (
        (5 <= mastersCount || mastersCount === 0)
        && (mastersCount % 10 >= 5 || mastersCount % 10 === 0)
        && mastersCount % 10 <= 10
      ) {
        foundedMasters = `Найдено ${mastersCount} мастеров`
      }
      if (11 <= mastersCount % 100 && mastersCount % 100 <= 19) {
        foundedMasters = `Найдено ${mastersCount} мастеров`
      }
    }

    return (
      <div className="screen-three ">
        <Header />
        <PanelHeader left={
          <PanelHeaderButton
              onClick={() => window.history.back()}>
            <Icon28ChevronBack fill="#FFF" />
          </PanelHeaderButton
          >
        }>
          <span>{this.props.customerServices.selected_option.label}</span>
        </PanelHeader>

        <div className="container screen-three__button">
          <div className="row">
            <div >
              <Button
                id={1}
                buttonText="Список"
                isActive={this.props.currentTab === 1}
                onClick={this.props.toggleTabs}
              />
            </div>
            <div >
              <Button
                id={2}
                buttonText="Карта"
                isActive={this.props.currentTab === 2}
                onClick={this.props.toggleTabs}
              />
            </div>
            {/* <div className="col-3">
              <Button
                id={3}
                buttonText="Лента"
                isActive={this.props.currentTab === 3}
                onClick={this.props.toggleTabs}
              />
            </div> */}
          </div>
        </div>

        <Filter
          bigFilter={this.props.currentTab === 1}
          type={this.props.currentTab === 3 ? 'city' : ''}
          priceFrom={this.state.priceFrom}
          priceTo={this.state.priceTo}
          setPriceFrom={this.setPriceFrom}
          setPriceTo={this.setPriceTo}

          disabled={this.props.fetchedUser && this.props.fetchedUser.coordinates === undefined}
          fetchedUser={this.props.fetchedUser}
          setCoordinates={this.props.setCoordinates}

          searchFilterRadius={this.props.searchFilterRadius}
          searchFilterSortType={this.props.searchFilterSortType}
          searchFilterSortType2={this.props.searchFilterSortType2}

          priceFrom={this.props.priceFrom}
          priceTo={this.props.priceTo}
          setActiveModal={this.props.setActiveModal}
          MODAL_PAGE_FILTERS={this.props.MODAL_PAGE_FILTERS}
          modalHistory={this.props.modalHistory}
          activeModal={this.props.activeModal}
          updateModal={this.props.updateModal}

          setSearchFilterRadius={this.props.setSearchFilterRadius}
          setSearchFilterSortType={this.props.setSearchFilterSortType}
          setSearchFilterSortType2={this.props.setSearchFilterSortType2}
        />

        <div className={"container screen-three__founded-masters" + (
          this.props.currentTab === 2 ? " screen-three__founded-masters_map" : "")}
          onClick={this.toggleScroll}
        >
          <div className="row">
            <div className="col">
            {this.props.currentTab <= 2 ? (<span>{foundedMasters}</span>) : (
              <div className='create-post'>
                <button className='button' onClick={() => this.onModal()}>+</button>
              </div>
            ) }
            </div>
          </div>
        </div>
        {
          this.props.currentTab === 1 &&
          Array.isArray(this.props.masters) &&
          this.props.masters.length > 0 &&

          <div className="masters-list">
            {
              masters
                .sort(this[
                  this.props.fetchedUser && this.props.fetchedUser.coordinates ?
                    this.props.searchFilterSortType.selected_option.sort :
                    this.props.searchFilterSortType2.selected_option.sort])
                .sort(this.immediately)
                .map((item, index) =>{
                  if (index < 100) {
                    return <Link
                        key={index + item}
                        to="/master"

                        onClick={this.props.go}
                        data-to="/master"

                    >
                      <div onClick={() => {
                        this.masterOnClick(item)}}>
                        <Post
                            pink={item.is_immediately}
                            item={item}
                            is_approved={item.is_approved}
                            fetchedUser={this.props.fetchedUser}
                        />
                      </div>
                    </Link>
                  }
                 })
            }
          </div>
        }
        {
          this.props.currentTab === 2 &&
          <div className="back" />
        }
        {
          this.props.currentTab === 2 &&
          <Map
            osname={this.props.osname}
            go={this.props.go}
            zoom={this.state.zoom}
            setZoom={this.setZoom}

            markerPosition={this.state.markerPosition}
            currentTab={this.props.currentTab}
            masters={masters}
            setMaster={this.props.setMaster}
            setCoordinates={this.props.setCoordinates}
            fetchedUser={this.props.fetchedUser}

            radius={this.props.searchFilterRadius.selected_option.radius / 1000}
            screenThree={this.screenThree}
          />
        }
        {/* {this.state.modal && this.props.currentTab === 3 ? <ModalFeed onSend={this.sendNewPost}/> : ''}
        {
          this.props.currentTab === 3 &&
          <>
          <Feed masterOnClick={this.masterOnClick} posts={this.state.posts} deletePost={this.deletePost} hasMore={this.state.hasMore} addPosts={this.addPosts} page={this.state.page}/>
          </>
        } */}
      </div>
    );
  }
}

export default ScreenThree;
