import React from 'react'
import Icon24Document from '@vkontakte/icons/dist/24/camera'
import { 
  FormLayout,
  Input,
  Textarea,
  Button,
  File,
  Div
} from '@vkontakte/vkui'


class FeedModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: {
        value: '',
        statusError: true
      },
      text: {
        value: '',
        statusError: true
      },
      files: {
        value: [],
        statusError: true
      },
      previewPhotos: [],
      showStatus: false
    }
    this.handleOnChange = this.handleOnChange.bind(this)
    this.handleUpload = this.handleUpload.bind(this)
    this.handleSend = this.handleSend.bind(this)
  }

  handleOnChange (e) {
    const { name, value } = e.target
    this.setState({ [name]: { value, statusError: value ? false : true }})
  }

  handleUpload (e) {
    const value = e.target.files.length < 6 ? Array.prototype.slice.call( e.target.files ) : Array.prototype.slice.call( e.target.files, 0, 5 )
    this.setState({ files: {value, statusError: false }, previewPhotos: []})
  }

  async handleSend () {
    const { title, text, files, previewPhotos } = this.state
    if ( title.statusError || text.statusError )
      this.setState({ showStatus: true })
    else
      try {
        this.props.onSend({ title: title.value, text: text.value, files: files.value }, previewPhotos)
        this.setState(
          { title: {
          value: '',
            statusError: true
          },
          text: {
            value: '',
            statusError: true
          },
          files: {
            value: [],
            statusError: true
          },
          previewPhotos: [],
          showStatus: false
        })
      } catch (error) {
      }
  }

  render () {
    const { title, text, files, showStatus, previewPhotos } = this.state
    const imgs = previewPhotos.map((img, i) => (
        <img
          key={`prewiewimg${i}`}
          className='picture'
          src={img}
          alt='image'
        />
    ))

    if (previewPhotos.length < files.value.length) {
        files.value.map((file, i) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const imgs = previewPhotos
          let img = reader.result

          imgs.push(img)
          this.setState({ previewPhotos: imgs })
        }
        if (i === previewPhotos.length) {
          reader.readAsDataURL(file);
        }
      })
    }
    

    return (
      <FormLayout>
        <Input
          top='Введите название'
          name='title'
          value={title.value}
          onChange={this.handleOnChange}
          onFocus={() => this.setState({ showStatus: false })}
          status={showStatus ? title.statusError ? 'error' : 'default' : 'default'}
        />
        <Textarea
          top='Введите описание'
          name='text'
          value={text.value}
          onFocus={() => this.setState({ showStatus: false })}
          onChange={this.handleOnChange}
          status={showStatus ? text.statusError ? 'error' : 'default' : 'default'}
        />
        <File
          onChange={this.handleUpload}
          multiple
          name='file'
          top='Загрузите ваше фото'
          before={<Icon24Document />}
          className="big-button"
          size='xl'
          level='secondary'
        />
        <div className='preview'>
          {imgs}
        </div>
        <Div>Город: {this.props.currentCity}</Div>
        <Button
          className="big-button"
          size='xl'
          level='commerce'
          onClick={() => this.handleSend()}
          disabled={this.state.showStatus}
        >Опубликовать</Button>
      </FormLayout>
    )
  }
}

export default FeedModal
