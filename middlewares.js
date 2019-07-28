const _rewriteLocation = (location, environment) => {
  return location
    .replace('https:', 'http:')
    .replace(new RegExp(`(${environment})(.+?)(\/arquivos\/)`, 'g'), 'vtexlocal$2$3')
}

const _rewriteReferer = (referer, environment, protocol) => {
  if (protocol === 'https') {
    referer = referer.replace('http:', 'https:')
  }

  return referer
    .replace(new RegExp(`(${environment})(.+?)(\/arquivos\/)`, 'g'), 'vtexlocal$2$3')
}

const disableCompression = (req, res, next) => {
  req.headers['accept-encoding'] = 'identity';

  next()
}

const rewriteLocationHeader = environment => (req, res, next) => {
  const writeHead = res.writeHead

  res.writeHead = (statusCode, headers) => {
    if (headers && headers.location) {
      headers.location = _rewriteLocation(headers.location, environment)
    }

    res.writeHead = writeHead

    res.writeHead(statusCode, headers)
  }

  next()
}

const replaceHost = host => (req, res, next) => {
  req.headers.host = host

  next()
}

const replaceReferer = (environment, protocol, host) => (req, res, next) => {
  let referer = host

  if (typeof req.headers.referer !== 'undefined') {
    referer = _rewriteReferer(req.headers.referer, environment, protocol)
  }

  req.headers.referer = referer

  next()
}

const replaceHtmlBody = (environment, protocol) => (req, res, next) => {
  const ignoreReplace = [
    /\.js(\?.*)?$/,
    /\.css(\?.*)?$/,
    /\.svg(\?.*)?$/,
    /\.ico(\?.*)?$/,
    /\.woff(\?.*)?$/,
    /\.png(\?.*)?$/,
    /\.jpg(\?.*)?$/,
    /\.jpeg(\?.*)?$/,
    /\.gif(\?.*)?$/,
    /\.pdf(\?.*)?$/
  ]

  const ignore = ignoreReplace.some(ignore => {
    return ignore.test(req.url)
  })

  if (ignore) {
    return next()
  }

  let data = ''
  const write = res.write
  const end = res.end
  const writeHead = res.writeHead
  let proxiedStatusCode = null
  let proxiedHeaders = null

  res.writeHead = (statusCode, headers) => {
    proxiedStatusCode = statusCode;
    proxiedHeaders = headers;
  }

  res.write = chunk => data += chunk

  res.end = (chunk, encoding) => {
    if (chunk) {
      data += chunk
    }

    if (data) {
      if (protocol === 'https') {
        data = data.replace(new RegExp('(https)(.+?)(.vtex)', 'g'), `http$2$3`)
      }

      data = data.replace(new RegExp('vteximg', 'g'), 'vtexlocal')
      data = data.replace(new RegExp(`(${environment})(.+?)(\/arquivos\/)`, 'g'), 'vtexlocal$2$3')
    }

    // Restore res properties
    res.write = write
    res.end = end
    res.writeHead = writeHead

    if (proxiedStatusCode && proxiedHeaders) {
      proxiedHeaders['content-length'] = Buffer.byteLength(data)

      if (protocol === 'https') {
        delete proxiedHeaders['content-security-policy']
      }

      res.writeHead(proxiedStatusCode, proxiedHeaders)
    }

    res.end(data, encoding)
  }

  next()
}

const errorHandler = err => {
  console.log(`${err} >>> ${req.url}`)
}

export default {
  disableCompression,
  rewriteLocationHeader,
  replaceHost,
  replaceReferer,
  replaceHtmlBody,
  errorHandler
}
