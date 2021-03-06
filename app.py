from flask import Flask, render_template   #app = Flask(__name__)
from flask_sqlalchemy import SQLAlchemy  #needed for app initialization (see below - db)
from flask_bcrypt import Bcrypt  #needed for password storage
from flask_login import LoginManager, current_user #needed for login
from flask_mail import Mail
from meta import BaseConfig

SCHEMA = BaseConfig.SCHEMA

app = Flask(__name__)
app.config.from_object('meta.BaseConfig')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt()
login_manager = LoginManager(app)
login_manager.login_view = 'login' # if user isn't logged in it will redirect to login page
login_manager.login_message_category = 'info'

app.config.update(dict(
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 587,
    MAIL_USE_TLS = True,
    MAIL_USE_SSL = False,
    MAIL_USERNAME = 'chrisflask0212@gmail.com',
    MAIL_PASSWORD = BaseConfig.MAIL_PASSWORD,
    MAIL_SUPPRESS_SEND = False,
    MAIL_DEBUG = True,
    TESTING = False
))


mail = Mail(app)

from routesInst import *
from routesAdmin import *

if SCHEMA < 3 or SCHEMA == 6:
    from routesUser import *
    from routesPart import *
if SCHEMA == 3:
    from routesABC import *
if SCHEMA == 4:
    from routesPENG import *
if SCHEMA == 5:
    from routesFOOD import *
if SCHEMA == 7:
    from routesNME import *
if SCHEMA == 8:
    from routesFSE import *




if __name__ == '__main__':
    app.run()

