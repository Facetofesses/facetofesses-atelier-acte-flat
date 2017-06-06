import '../styles/core.scss'
import App from './App'
import 'gsap'
import './lib/pixi'

/* eslint no-new:0 */
new App()

if (module.hot) {
  module.hot.accept()
}
