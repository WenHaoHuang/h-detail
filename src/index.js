import Detail from './main';
import './style/index.scss';

/* istanbul ignore next */
const install = function(Vue) {
  Vue.component(Detail.name, Detail);
}

Detail.install = install;

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default Detail;
