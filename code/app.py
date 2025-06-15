from flask import Flask
from backend.models import db,User,Role
from flask_security import Security,SQLAlchemyUserDatastore
from backend.config import LocalDevelopmentConfig
from backend.celery.celery import celery_init_app
from flask_caching import Cache
import flask_excel as excel




def create_app():
    app = Flask(__name__,template_folder='frontend', static_folder='frontend',static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)

    #db init
    db.init_app(app)


    #flask security
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security = Security(app,datastore=datastore,register_blueprint=False)

    

    #init cache
    cache = Cache(app)
    app.cache = cache
    app.app_context().push()

    from backend.resource import api
    #flask restful init
    api.init_app(app)

    return app

app = create_app()

celery_app = celery_init_app(app)

from backend import routes

from backend import create_initial
from backend.celery import celery_schedule

#excel
excel.init_excel(app)

if __name__ == "__main__":
    app.run()