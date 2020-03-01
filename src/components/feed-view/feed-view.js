import React, {useEffect, useState} from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Separator from '@vkontakte/vkui/dist/components/Separator/Separator';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import moment from "moment";
import FixedLayout from "@vkontakte/vkui/dist/components/FixedLayout/FixedLayout";
import Icon24OpenIn from '@vkontakte/icons/dist/24/open_in';
import ScreenSpinner from "@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner";
import Select from "@vkontakte/vkui/dist/components/Select/Select";
import bridge from '@vkontakte/vk-bridge';



const FeedView = ({ id, setPopout, showPhoto, setActiveModal, user, popout}) => {

  const [postArr1, setPostArr1] = useState([])
  const [postArr2, setPostArr2] = useState([])
  const [fullArr, setfullArr] = useState([])
  const [cities, setCities] = useState("Санкт-Петербург")
  const [groupInfo, setGroupInfo] = useState(null)

  const citiesArr = ["Москва", "Санкт-Петербург", "Екатеринбург", "Краснодар", "Новосибирск", "Самара", "Нижний Новгород", "Челябинск",
  "Пермь", "Саратов", "Красноярск", "Воронеж", "Уфа", "Волгоград", "Тольятти", "Казань", "Омск", "Тюмень"]

  const groupArr = ["125749167", "143127603", "67371672", "159095179", "78767098", "174816818", "112183403", "110965038",
  "30951511", "151064575", "126879097", "115330743", "151802257", "168626426", "189911075", "147160705", "148369196", "185650440"]

  const tehGroupArr = ["192430200", "192430266", "192430283", "192430307", "192430331", "192430388", "192430407", "192430433",
    "192430501", "192430528", "192430540", "192430574", "192430603", "192430620", "192430636", "192430656", "192430664", "192430695"]


  useEffect(() => {
    setPopout(<ScreenSpinner size='large'/>)
    // getPost("-143127603")
    getGroupInfo("143127603")
    getTehPost("-192430266")
    getPost("-143127603")

  }, []);

  useEffect(() => {
    bridge.subscribe(({detail: {type, data}}) => {
      switch (type) {
        case 'VKWebAppUpdateConfig':
          const schemeAttribute = document.createAttribute('scheme');
          schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
          document.body.attributes.setNamedItem(schemeAttribute);
          break;
        case 'VKWebAppCallAPIMethodResult':
          switch (data.request_id) {
            case 'getPosts':
              setPostArr2(postArr2.concat(data.response.items))
              setPopout(null)
              break;
            case 'getTehPost':
              setPostArr1(postArr1.concat(data.response.items))
              setPopout(null)
              break;
            case 'getGroup':
              setGroupInfo(data.response[0])
              break;
            default:
              console.log(type)
          }
          break;
        default:
          console.log(type);
      }
    });

    return () => {
      bridge.unsubscribe(e => console.log("ответочка", e));
    };

  }, [cities]);


  const getDate = (date) => {
    return moment(date*1000).format('DD.MM.YYYY  h:mm')
  }

  const getPhotoArr = (arrDoc) => {
    let photoArr = []
    if(arrDoc) {
      for (let i = 0; i < arrDoc.length; i++) {
        if (arrDoc[i].type === "photo") {
          photoArr.push(arrDoc[i].photo)
        }
      }
    }
    return photoArr
  }

  const changeCities = (e) => {
    if (citiesArr.indexOf(e.target.value) >= 0) {
      setPostArr2([])
      setPostArr1([])
      getGroupInfo(groupArr[citiesArr.indexOf(e.target.value)])
      getTehPost(`-${tehGroupArr[citiesArr.indexOf(e.target.value)]}`)
      getPost(`-${groupArr[citiesArr.indexOf(e.target.value)]}`)
    }
    setCities(e.target.value)
  }

  const getLinkOffer = () => {
     return `https://vk.com/im?media=&sel=-$${tehGroupArr[citiesArr.indexOf(cities)]}`
  }

  const getGroupInfo = (group_id) => {
    bridge.send("VKWebAppCallAPIMethod", {
      "method": "groups.getById",
      "request_id": "getGroup",
      "params": {
        "fields": 'description',
        "group_ids": group_id,
        "v": "5.105",
        "access_token": 'c6f961fbc6f961fbc6f961fbf0c696cc53cc6f9c6f961fb98bd9f39d8cccff2eea6e9d3'
      }
    })
  }
  const getTehPost = (group) => {
    setPopout(<ScreenSpinner size='large'/>)
    bridge.send("VKWebAppCallAPIMethod", {
      "method": "wall.get",
      "request_id": "getTehPost",
      "params": {
        "filters": 'post',
        "owner_id": group,
        "count": 5,
        "v": "5.105",
        "access_token": 'c6f961fbc6f961fbc6f961fbf0c696cc53cc6f9c6f961fb98bd9f39d8cccff2eea6e9d3'
      }
    })
  }

  const getPost = (group) => {
    setPopout(<ScreenSpinner size='large'/>)
    bridge.send("VKWebAppCallAPIMethod", {
      "method": "wall.get",
      "request_id": "getPosts",
      "params": {
        "filters": 'post',
        "owner_id": group,
        "count": 5,
        "v": "5.105",
        "access_token": 'c6f961fbc6f961fbc6f961fbf0c696cc53cc6f9c6f961fb98bd9f39d8cccff2eea6e9d3'
      }
    })
  }

  const gerUserPostId = (text) => {
    return text.split('m~C*W8!')[0]
  }

  const gerUserPostText = (text) => {
    if (text.indexOf('m~C*W8!') > 0) {
        return text.split('m~C*W8!')[1]
    } else {
      return text
    }
  }

  return <Panel id={id}>
    <PanelHeader ><span className='header_text'>Лента</span></PanelHeader>
    <Div>
      <Select
          top="Город"
          // className='fixed-margin-top'
          placeholder="Выбрать город"
          onChange={changeCities}
          value={cities}
      >
        {citiesArr.map((city) => <option key={city} value={city}>{city}</option>)}
      </Select>

    </Div>
    <Group>
      {postArr1 && postArr1.length> 0 && postArr1.map((p) => {
        if (!p.is_pinned) {
          return <Div key={p.id}>
            <Cell
                before={<Avatar className='fix-avatar' src={groupInfo && groupInfo.photo_50} size={48}></Avatar>}
                description={getDate(p.date)}
            >
              <a className='text-decor-none' target='_blank' href={`https://vk.com/public${groupInfo.id}`}>{groupInfo && groupInfo.name}</a>
            </Cell>
            {gerUserPostText(p.text)}
            {getPhotoArr(p.attachments).length > 0 && <Div ><div className='photo-shell'>{getPhotoArr(p.attachments).map((p) => {
              let lastItem = p.sizes.length - 1
              // return <a key={p.id} href={p.sizes[lastItem].url}><img src={p.sizes[lastItem].url} alt={'img'} /></a>
              return <div className='photo-div' key={p.id}><img key={p.id} className='photo-post' src={p.sizes[lastItem].url} alt={'img'} onClick={() => showPhoto(p.sizes[lastItem].url)} /></div>
            })}</div>
              <Separator wide />
              <div className='post-button-block'>
                <a target='_blank' className='fix-link' href={p.text.indexOf('m~C*W8!') > 0 ? `https://vk.com/id${gerUserPostId(p.text)}` : `https://vk.com/public${groupInfo.id}`} > <Button mode="secondary" className='fix-margin-icon' >Профиль</Button></a>
                <a target='_blank' className='fix-link' href={p.text.indexOf('m~C*W8!') > 0 ? `https://vk.com/write${gerUserPostId(p.text)}` : `https://vk.com/public${groupInfo.id}`} > <Button className='fix-margin-icon button-send' >Написать</Button></a>
              </div>
            </Div>
            }
            <FixedLayout vertical="bottom">
              {/*<Button before={<Icon24OpenIn/>} size="xl" onClick={() => setActiveModal('sendPost')} > Предложить новость </Button>*/}
              <Button before={<Icon24OpenIn/>} size="xl" href={`https://m.vk.com/wall-${groupInfo.id}?act=add&from=suggest`} > Предложить новость </Button>
            </FixedLayout>

          </Div>
        }
      })}
      {postArr2 && postArr2.length> 0 && postArr2.map((p) => {
        if (!p.is_pinned) {
          return <Div key={p.id}>
            <Cell
                before={<Avatar className='fix-avatar' src={groupInfo && groupInfo.photo_50} size={48}></Avatar>}
                description={getDate(p.date)}
            >
              <a className='text-decor-none' target='_blank' href={`https://vk.com/public${groupInfo.id}`}>{groupInfo && groupInfo.name}</a>
            </Cell>
            {p.text}
            {getPhotoArr(p.attachments).length > 0 && <Div ><div className='photo-shell'>{getPhotoArr(p.attachments).map((p) => {
              let lastItem = p.sizes.length - 1
              // return <a key={p.id} href={p.sizes[lastItem].url}><img src={p.sizes[lastItem].url} alt={'img'} /></a>
              return <div className='photo-div' key={p.id}><img key={p.id} className='photo-post' src={p.sizes[lastItem].url} alt={'img'} onClick={() => showPhoto(p.sizes[lastItem].url)} /></div>
            })}</div>
              <Separator wide />
              <div className='post-button-block'>
                <a target='_blank' className='fix-link' href={p.signer_id ? `https://vk.com/id${p.signer_id}` : `https://vk.com/public${groupInfo.id}`} > <Button mode="secondary" className='fix-margin-icon' >Профиль</Button></a>
                <a target='_blank' className='fix-link' href={p.signer_id ? `https://vk.com/write${p.signer_id}`: `https://vk.com/public${groupInfo.id}`} > <Button className='fix-margin-icon button-send' >Написать</Button></a>
              </div>
            </Div>
            }
            <FixedLayout vertical="bottom">
              {/*<Button before={<Icon24OpenIn/>} size="xl" onClick={() => setActiveModal('sendPost')} > Предложить новость </Button>*/}
              <Button before={<Icon24OpenIn/>} size="xl" target='_blank' href={`https://vk.com/im?media=&sel=-${tehGroupArr[citiesArr.indexOf(cities)]}`} > Предложить новость </Button>
            </FixedLayout>

          </Div>
        }
      })}
    </Group>
    <div className='fix-bottum-feed'>
.
    </div>
  </Panel>
};



export default FeedView;
