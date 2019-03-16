import React, { Component } from 'react'
import ImageUploader from 'react-images-upload'
import foreground from './template/foreground.png'
import './App.css'
import { Card, Typography, Slider, Button, Input } from 'antd'
import { createCanvas, loadImage } from 'canvas'

const { Text } = Typography
const { TextArea } = Input

const DEFAULT_COVER_MARGIN_TOP = 250
const DEFAULT_TEXT_MARGIN = 50
const DEFAULT_SHADOW_OPACITY = 30
const DEFAULT_IMAGE_QUALITY = 100
const FONT_SIZE = '40px'
const DEFAULT_FILE_NAME = 'cover.jpg'
const MAX_TEXT_COVER = 50

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      originalDataUrl: undefined,
      coverDataUrl: undefined,
      text1: undefined,
      text2: undefined,
      isImageSelected: false,
      coverMarginTop: DEFAULT_COVER_MARGIN_TOP,
      shadowOpacity: DEFAULT_SHADOW_OPACITY,
      imageQuality: DEFAULT_IMAGE_QUALITY
    }
  }

  generateCover = async () => {
    const canvas = createCanvas(1200, 700)
    const context = canvas.getContext('2d')
    const { originalDataUrl, text1, text2, shadowOpacity, coverMarginTop, imageQuality } = this.state

    // Draw background
    context.drawImage(await loadImage(originalDataUrl), 0, 0)

    // Draw shadow
    context.fillStyle = 'rgba(0, 0, 0, ' + shadowOpacity / 100 + ')'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw foreground image
    let foregroundImage = await loadImage(foreground)
    context.drawImage(foregroundImage, (canvas.width - foregroundImage.width) / 2, coverMarginTop)

    // Draw foreground 1st cover text
    const title1 = text1 || ''
    context.font = FONT_SIZE + ' "Arial"'
    context.fillStyle = 'white'
    context.fillText(
      title1,
      (canvas.width - context.measureText(title1).width) / 2,
      coverMarginTop + foregroundImage.height + DEFAULT_TEXT_MARGIN
    )

    // Draw foreground 2nd cover text
    const title2 = text2 || ''
    context.font = FONT_SIZE + ' "Arial"'
    context.fillStyle = 'white'
    context.fillText(
      title2,
      (canvas.width - context.measureText(title2).width) / 2,
      coverMarginTop + foregroundImage.height + DEFAULT_TEXT_MARGIN + DEFAULT_TEXT_MARGIN
    )

    // Update to state
    this.setState({
      coverDataUrl: canvas.toDataURL('image/jpeg', imageQuality)
    })
  }

  loadImage = source => {
    return new Promise((resolve, reject) => {
      let image = new Image()
      image.src = source
      image.onload = () => {
        resolve(image)
      }
    })
  }

  onImageSelected = (files, dataUrls) => {
    if (dataUrls.length > 0 && dataUrls[0] !== undefined) {
      this.setState({
        originalDataUrl: dataUrls[0],
        isImageSelected: true
      })
      this.refresh()
    }
  }

  onTextChanged = e => {
    let words = e.target.value.split('\n')
    words = words
      .map(word => {
        return word.slice(0, MAX_TEXT_COVER)
      })
      .slice(0, 2)
    e.target.value = words.join('\n')
    this.setState({
      text1: words[0],
      text2: words[1]
    })
    this.refresh()
  }

  onMarginTopChanges = value => {
    this.setState({
      coverMarginTop: value
    })
    this.refresh()
  }

  onShadowOpacityChanged = value => {
    this.setState({
      shadowOpacity: value
    })
    this.refresh()
  }

  onImageQualityChanged = value => {
    this.setState({
      imageQuality: value
    })
    this.refresh()
  }

  refresh = () => {
    setTimeout(() => {
      this.generateCover()
    }, 300)
  }

  downloadCover = () => {
    let a = document.createElement('a')
    a.href = this.state.coverDataUrl
    a.download = DEFAULT_FILE_NAME
    a.click()
  }

  backToMain = () => {
    this.setState({
      originalDataUrl: undefined,
      coverDataUrl: undefined,
      text1: undefined,
      text2: undefined,
      isImageSelected: false, 
      coverMarginTop: DEFAULT_COVER_MARGIN_TOP,
      shadowOpacity: DEFAULT_SHADOW_OPACITY,
      imageQuality: DEFAULT_IMAGE_QUALITY
    })
  }

  render() {
    const { coverDataUrl, isImageSelected } = this.state
    return (
      <div className="App">
        {isImageSelected ? (
          <Card className="cover-generator">
            <div className="cover-generator-header">
              <Button className="back-button" icon="arrow-left" size="default" onClick={this.backToMain}>
                Back
              </Button>
            </div>
            <div>
              <img className="image-render" src={coverDataUrl} alt="" onClick={this.downloadCover} />
            </div>
            <div>
              <Text className="download-description">Click on the image to download</Text>
            </div>
            <div className="cover-text">
              <TextArea
                className="cover-text-title"
                placeholder="Text on cover image"
                autosize={{ minRows: 1, maxRows: 2 }}
                onChange={this.onTextChanged}
              />
            </div>
            <div className="text-margin">
              <Text className="text-margin-label">Text Margin</Text>
              <Slider
                className="text-margin-slider"
                defaultValue={250}
                min={100}
                max={450}
                onChange={this.onMarginTopChanges}
              />
            </div>
            <div className="shadow-opacity">
              <Text className="shadow-opacity-label">Shadow</Text>
              <Slider
                className="shadow-opacity-slider"
                defaultValue={30}
                min={0}
                max={100}
                step={10}
                dots={true}
                onChange={this.onShadowOpacityChanged}
              />
            </div>
            <div className="image-quality">
              <Text className="image-quality-label">Image Quality</Text>
              <Slider
                className="image-quality-slider"
                defaultValue={100}
                min={50}
                max={100}
                step={10}
                dots={true}
                onChange={this.onImageQualityChanged}
              />
            </div>
          </Card>
        ) : (
          <ImageUploader
            className="upload-button"
            withIcon={true}
            singleImage={true}
            buttonText="Choose image"
            label="JPG, JPEG, PNG (Maximum 10MB)"
            accept="image/png, image/jpeg"
            imgExtension={['.jpg', '.jpeg', '.png']}
            maxFileSize={10485760}
            onChange={this.onImageSelected}
          />
        )}
      </div>
    )
  }
}

export default App
