from flask import current_app as app
from .models import db, CampCategory
from flask_security import hash_password, SQLAlchemyUserDatastore

try:
    with app.app_context():
        db.create_all()

        user_datastore : SQLAlchemyUserDatastore = app.security.datastore

        # Create roles
        user_datastore.find_or_create_role(name='admin', description='superuser')
        user_datastore.find_or_create_role(name='sponsor', description='specialuser')
        user_datastore.find_or_create_role(name='influencer', description='generaluser')

        # Create user if not exists
        if not user_datastore.find_user(email='admin@gmail.com'):
            user_datastore.create_user(
                email='admin@gmail.com',
                password=hash_password('admin'),
                roles=['admin']
            )
        #create a category
        categoryName = "finance"
        categoryName = categoryName.upper()
        if not CampCategory.query.filter_by(name=categoryName).first():
            category = CampCategory(name=categoryName)
            db.session.add(category)
            db.session.commit()

        db.session.commit()

except Exception as e:
    app.logger.error(f"An error occurred while creating database: {e}")
    db.session.rollback()
