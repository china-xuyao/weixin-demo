import wepy from 'wepy'
/**
 * Http 请求
 *
 * @class http
 */
class http {
  /**
   *Creates an instance of http.
   * @param {String} domainName 请求域名
   * @param {Object} apiConfig RESTful API 配置
   * @param {Object} header 请求头
   * @memberof http
   */
  constructor(domainName, apiConfig, header) {
    this._domainName = domainName
    this._apiConfig = apiConfig
    this._header = {}
    if (header) {
      this._header = header
    }
  }

  auto (apiModule, apiMethod, params) {
    let requestAPI = this.getRequestAPI(apiModule, apiMethod, params)
    if (requestAPI == null) {
      return
    }
    return new Promise((resolve, reject) => {
      wepy.request({
        url: requestAPI.url,
        data: params ? params.data : null,
        header: Object.assign(this._header, params ? params.header : null),
        method: requestAPI.method
      }).then(res => {
        if (res && res.data && res.data.status == 200) {
          // 200: 服务端业务处理正常结束
          resolve(res.data)
        } else {
          // 其它错误，提示用户错误信息
          if (this._errorHandler != null) {
            // 如果有统一的异常处理，就先调用统一异常处理函数对异常进行处理
            this._errorHandler(res)
          }
          reject(res)
        }
      }).catch(res => {
        reject(res)
      })
    })
  }

  getRequestAPI (apiModule, apiMethod, params) {
    let requestAPI = this._apiConfig[apiModule][apiMethod]
    if (requestAPI == null) {
      console.error(`HTTP Auto: Can not find the config by apiModule and apiMethod. You can check the service-api.config.js file.`)
      return null
    }
    requestAPI.url = this._domainName + this.replaceUrlParams(requestAPI.url, params)
    return requestAPI
  }


  /**
   * Replace Url Params
   * Replace the url/{key}/ with params value.
   * @param {any} url string
   * @param {any} params object
   * @returns string
   */
  replaceUrlParams (url, params) {
    if (params && params.data) {
      let data = params.data
      if (typeof url === 'string') {
        let urlArray = url.split(`{`)
        if (urlArray.length <= 1 && typeof data === 'object' && data.length < 1) {
          return url
        }
        return urlArray.reduce((res, cur) => {
          let key = cur.split(`}`)[0]
          return res + data[key] + '/'
        })
      }
    }
    return url
  }
}
export default http