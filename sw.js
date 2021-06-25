
// imports
importScripts('js/sw-utils.js');

// 1- Ponemos los tres tipos de cache y los APP_SELL
const STATIC_CACHE    = 'static-3';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// 1.1 Guardamos los caches
self.addEventListener('install', e => {

	// guardamos cache estatic
	const cacheStatic = caches.open(STATIC_CACHE).then(cache => {
		cache.addAll(APP_SHELL)
	})

	// guardamos el cache inmutable
	const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => 
	    cache.addAll( APP_SHELL_INMUTABLE ));


	// esperamos al guardado de caches
	e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

})

// 1.2 proceso para que cada vez que cambiemos el SW se borren los
// caches estáticos anteriores
self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            // if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
            //     return caches.delete(key);
            // }

        });

    });

    e.waitUntil( respuesta );

});

// 2- Cache con Network Fallback
self.addEventListener( 'fetch', e => {


    const respuesta = caches.match( e.request ).then( res => {

        if ( res ) {	// Si la encuentra en cache la devuelve y termina

            return res;	

        } else {	// Si entra aquí es que hay peticiones que no tenemos almacenadas, 
                    // algunas sales p.e. de los links de fonts, y pasan a este else

            return fetch( e.request ).then( newRes => {

            	// si la respuesta es ok, actualiza el cache dinamico y la devuelve
            	// si no es ok, la devuelve sin más
                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );

            });

        }

    });

    e.respondWith( respuesta );

});