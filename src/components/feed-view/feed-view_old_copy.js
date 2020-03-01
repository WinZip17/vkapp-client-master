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

import { PanelHeader, HeaderButton } from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';

class FeedView extends Component {
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
      // this.setState({ posts: res.data, feedParams });
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
      this.props.setAlert(`${error.response.data.link ? 'Превышен лимит' : 'Ошибка'}`, `${error.response.data.status}`, error.response.data.link ? <a target='_blank' href={error.response.data.link}>публикации в ленте без ограничений</a> : '')
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



    return (
      <div className="screen-three ">
        <Header />
        <PanelHeader >
          <span className='header_text'>Лента </span>
        </PanelHeader>

        <Filter
          type='city'
          priceFrom={this.state.priceFrom}
          priceTo={this.state.priceTo}
          setPriceFrom={this.setPriceFrom}
          setPriceTo={this.setPriceTo}
          currentCity={this.props.currentCity.title ? this.props.currentCity.title : this.props.fetchedUser.city ? this.props.fetchedUser.city.title : 'Санкт-Петербург'}
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

        <div className={"container screen-three__founded-masters"}
          onClick={this.toggleScroll}
        >
          <div className="row">
            <div className="col">
              <div className='create-post'>
                <button className='button' onClick={() => this.onModal()}>+</button>
              </div>
            </div>
          </div>
        </div>


         {this.state.modal ? <ModalFeed currentCity={this.props.currentCity.title ? this.props.currentCity.title : this.props.fetchedUser.city ? this.props.fetchedUser.city.title : 'Санкт-Петербург'} onSend={this.sendNewPost}/> : ''}

          <>
          <Feed masterOnClick={this.masterOnClick} posts={this.state.posts} deletePost={this.deletePost} hasMore={this.state.hasMore} addPosts={this.addPosts} page={this.state.page}/>
          </>

      </div>
    );
  }
}

export default FeedView;
