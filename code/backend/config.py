class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///noordb.sqlite3"
    SECRET_KEY = "this-is-my-secret-key"
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'this-is-noor-password-salt'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    #SECURITY_TOKEN_MAX_AGE = 3600

    

    # cache specific
    CACHE_TYPE =  "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379


    WTF_CSRF_ENABLED = False
