
all:
	@mongo monkeydb init-db.js
	@echo "db.namespaces.find().sort({'created': -1})[0];" | mongo monkeydb

clean: 
	@echo "db.objects.remove()" | mongo monkeydb
