import React from 'react'
import { Link } from 'react-router-dom'
import img from '../../logo.svg'
import ico from '../../user-check-solid.svg'
import './Feed.css'
import InfiniteScroll from 'react-infinite-scroll-component';
import bridge from '@vkontakte/vk-bridge';



export class Feed extends React.Component {



  handleOpenImage (url, images, index) {
    const imgs = images.map(img => `${url}${img}`)

      bridge.send("VKWebAppShowImages", {
      images: imgs,
      start_index: index
    });
  }

  render () {
    const { posts } = this.props
    const listPosts = posts ? posts.map((elem, index) => {
      let imgList = []
      let imgs = []
      if (elem.images) {
        const single = elem.images.indexOf(',')
        imgList = single > -1 ? elem.images.split(',') : [elem.images]
        const { REACT_APP_IMAGES_URL } = process.env
        imgs = imgList.map((img, i, urls) => (
          <img
            key={`preview${i}`}
            className='picture'
            onClick={() => this.handleOpenImage(REACT_APP_IMAGES_URL, urls, i)}
            src={`${REACT_APP_IMAGES_URL}${img}`}
            alt='img'
          />
        ))
      }
      else if (elem.previewPhotos) {
        imgList = elem.previewPhotos
        const { REACT_APP_IMAGES_URL } = process.env
        imgs = imgList.map((img, i, urls) => (
          <img
            key={`preview${i}`}
            className='picture'
            onClick={() => this.handleOpenImage(REACT_APP_IMAGES_URL, urls, i)}
            src={img}
            alt='img'
          />
        ))
      }
      return (
        <div className='feed_container__item' key={index}>
          {
            sessionStorage.getItem('role') === 'ADMIN' ?
            <div className='close'
            onClick={() => {
              this.props.deletePost(elem.id)
            }}
            >&#215;</div> : null
          }
          <div className='feed_container__item___author'>

            <p>{elem.full_name}</p>
          <span> {new Date(elem.date_add).toLocaleDateString('RU')}</span>
          </div>
          <div className='feed_container__item___text'>
            <p>{elem.title}</p>
            <p>{elem.text}</p>
          </div>
          <div className='feed_container__item___img'>
            {imgs}
          </div>
          <div className='feed_container__item___buttons'>
            <div>
              {elem.role === 'MASTER' ? (
                <Link className='feed_container__item___link' to='/masters'>
                  <img
                    onClick={() => {
                      console.log('elem',elem)
                      this.props.masterOnClick(elem)
                    }}
                    src={ico}
                    alt=''
                  />
                </Link>
              ) : ''}
            </div>
            <a className="button" href={`https://vk.com/write${elem.vk_id}`} >Я хочу!</a>
          </div>
        </div>
      )
    }) : 'Loading...'
    const scrollList = <InfiniteScroll
      dataLength={posts.length}
      next={() => this.props.addPosts()}
      hasMore={this.props.hasMore}
      loader={ <div style={{ margin: "auto" }} className="dot-carousel"></div> }
      endMessage={
          <p style={{ textAlign: "center" }}>
          <b>На этом все, пока...</b>
          </p>
      }
    >
      {listPosts}
    </InfiniteScroll>

    return (
      <div className='feed_container'>
          {scrollList}
      </div>
    )
  }
}

export default Feed
