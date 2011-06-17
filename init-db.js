
db.namespaces.remove();
db.namespaces.insert({
	uri: 'http://www.csfd.cz/film/<id>-<coolurl>/?', 
	type: "Movie", 
	regex: {
		"id": /\d+/,
		"coolurl": /[^\/]+/,
	},
        scraper: 'cz.csfd',
});

db.namespaces.insert({
	uri: 'http://www.imdb.com/title/<id>/?', 
	type: "Movie", 
	regex: {
		"id": /tt\d+/,
	},
        scraper: 'com.imdb',
});

db.namespaces.insert({
	uri: 'http://www.last.fm/music/<coolurl>/?', 
	type: "MusicGroup", 
	regex: {
		"coolurl": /[^\/]+/,
	},
        scraper: 'fm.last',
});

db.namespaces.insert({
	uri: 'http://www.freebase.com/view<id>/?', 
	type: null, 
	regex: {
		"id": /\/(m|en)\/[^\/]+/,
	},
        scraper: 'com.freebase',
});

db.namespaces.insert({
	uri: 'http://www.nasipolitici.cz/cs/politik/<id>-<coolurl>/?', 
	type: 'Person', 
	regex: {
		"id": /\d+/,
		"coolurl": /[^/]+/,
	},
        scraper: 'cz.nasipolitici',
});
db.namespaces.insert({
	uri: 'http://www.fdb.cz/film/<id>-<coolurl>.html', 
	type: 'Movie', 
	regex: {
		"id": /\d+/,
		"coolurl": /[^/]+/,
	},
        scraper: 'cz.fdb',
});

db.namespaces.insert({
	uri: 'http://www.rottentomatoes.com/m/<coolurl>/?', 
	type: 'Movie', 
	regex: {
		"coolurl": /[^/]+/,
	},
        scraper: 'com.rottentomatoes',
});

db.namespaces.insert({
	uri: 'http://www.firmy.cz/detail/<id>-<coolurl>.html', 
	type: 'Organization', 
	regex: {
		"id": /\d+/,
		"coolurl": /[^/]+/,
	},
        scraper: 'cz.firmy',
});

db.namespaces.insert({
	uri: 'http://www.last.fm/user/<coolurl>/?', 
	type: 'Person', 
	regex: {
		"coolurl": /[^/]+/,
	},
        scraper: 'fm.last_user',
});











