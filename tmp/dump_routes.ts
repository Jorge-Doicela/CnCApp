
import 'reflect-metadata';
import './config/di.container';
import express from 'express';
import capacitacionRoutes from './infrastructure/web/routes/capacitacion.routes';

const app = express();
app.use('/api/capacitaciones', capacitacionRoutes);

function print(path: any, layer: any) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp.source))))
  } else if (layer.method) {
    console.log('%s /%s', layer.method.toUpperCase(), path.concat(split(layer.regexp.source)).filter(Boolean).join('/'))
  }
}

function split(thing: any) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

app._router.stack.forEach(print.bind(null, []))
