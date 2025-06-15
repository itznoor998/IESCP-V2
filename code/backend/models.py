from flask_security import UserMixin, RoleMixin 
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import  pytz
mytimezone = pytz.timezone('Asia/Kolkata')


db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(), unique=True, nullable=False)
    password = db.Column(db.String(), unique=True, nullable=False)
    flagged = db.Column(db.Boolean, default=False)
    fs_uniquifier = db.Column(db.String(), unique=True, nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)
    last_login = db.Column(db.DateTime(), default=datetime.now().astimezone(mytimezone))
    roles = db.relationship('Role', backref='user', secondary='user_role')





class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String())


class UserRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))



class Sponsor(db.Model):
    __tablename__ = 'sponsors' 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    company_name = db.Column(db.String(), nullable=False)
    industry = db.Column(db.String(), nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String())
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'))
    user = db.relationship('User',backref=db.backref('sponsor',uselist=False))

    



class Influencer(db.Model):
    __tablename__ = 'influencers' 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    category = db.Column(db.String(), nullable=False)
    niche = db.Column(db.String(), nullable=False)
    followers = db.Column(db.Integer, nullable=False)
    platform = db.Column(db.String(), nullable=False)
    description = db.Column(db.String())
    earnings = db.Column(db.Integer)
    total_ratings = db.Column(db.Integer)
    no_of_ratings = db.Column(db.Integer)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'))
    user = db.relationship('User',backref=db.backref('influencer',uselist=False))



class Camp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    goal = db.Column(db.String(), nullable=False)
    start_date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.now)
    end_date = db.Column(db.DateTime(), nullable=False)
    description = db.Column(db.String())
    visibility = db.Column(db.Boolean, default=False)
    budget = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(), nullable=False)
    flagged = db.Column(db.Boolean, default=False)
    spon_id = db.Column(db.Integer, db.ForeignKey('sponsors.id')) 
    sponsor = db.relationship('Sponsor', backref=db.backref('camp'))


class Ad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    terms = db.Column(db.String(),nullable=False)
    status = db.Column(db.String(),nullable=False)
    inf_messages = db.Column(db.String())
    spon_messages = db.Column(db.String())
    payment = db.Column(db.Integer,nullable=False)
    camp_id = db.Column(db.Integer, db.ForeignKey('camp.id'))
    camp = db.relationship('Camp', backref=db.backref('ad'))
    inf_id = db.Column(db.Integer, db.ForeignKey('influencers.id')) 
    influencer = db.relationship('Influencer', backref=db.backref('ad')) 
    flagged = db.Column(db.Boolean, default=False)





class CampCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False,unique=True)



class InterestedCamp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(), nullable=False)
    inf_id = db.Column(db.Integer, db.ForeignKey('influencers.id')) 
    influencer = db.relationship('Influencer', backref=db.backref('interested'))
    camp_id = db.Column(db.Integer, db.ForeignKey('camp.id'))
    camp = db.relationship('Camp', backref=db.backref('interested'))