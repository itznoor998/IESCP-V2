from datetime import datetime
import os
from flask_login import current_user
from flask_security import auth_required, verify_password, hash_password
from flask import current_app as app, jsonify, render_template, request, send_file
from backend.models import CampCategory, InterestedCamp, db, User, Role, Sponsor,Influencer,Camp,Ad
from backend.celery.task import create_csv
from celery.result import AsyncResult

datastore = app.security.datastore




#  <----------------------------------------Base Routes--------------------------------------------------->

@app.get('/')
def home():
    return render_template('index.html')


@app.route('/register',methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email',None)
    password = data.get('password',None)
    role = data.get('role',None)
    name = data.get('name',None)
    description = data.get('description',None)

    if not email or not password or role not in ['admin','influencer','sponsor']:
        msg = jsonify({"message" : "invalid requests"})
        return msg , 404
    user = datastore.find_user(email=email)
    if  user:
        return jsonify({"message" : "You have already registered"}),301
    try:
        datastore.create_user(email=email, password=hash_password(password), roles = [role], active=True)
        db.session.commit()
        user = User.query.filter_by(email=email).first()
        if role=='sponsor':
            company_name = data.get('company_name',None)
            industry = data.get('industry',None)
            budget = data.get('budget','0')
            budget = int(budget)
            spon = Sponsor(name=name,company_name=company_name,industry=industry,budget=budget,description=description,user_id=user.id)
            db.session.add(spon)
            db.session.commit()
        elif role=='influencer':
            category = data.get('category',None)
            niche = data.get('niche',None)
            followers = data.get('followers',0)
            platform = data.get('platform',None)
            category = category.upper()
            inf = Influencer(name=name,category=category,niche=niche,followers=followers,platform=platform,description=description,earnings=0,total_ratings=0,no_of_ratings=0,user_id=user.id)
            campCategory = CampCategory.query.filter_by(name=category).first()
            if not campCategory:
                campCat = CampCategory(name=category)
                db.session.add(campCat)
            db.session.add(inf)
            print("added")
            db.session.commit()
        return jsonify({"message" : "user created successfully. You may login"}),200
    except:
        db.session.rollback()
        print("rollback")
        return jsonify({"message" : "erro while creating user"}),404


@app.route('/login',methods=['POST'])
def login(): 
    data = request.get_json()
    email = data.get('email',None)
    password = data.get('password',None)

    if not email or not password :
        msg = jsonify({"message" : "Check your email or password","success":False})
        return msg , 404
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message" : "Invalid email","success":False}),401
    if verify_password(password, user.password):
        return jsonify({"success":True,"token" : user.get_auth_token(), "email" : email, "role" : user.roles[0].name, "id" : user.id}),200
    return jsonify({"message" : "Wrong password","success":False}),404



@app.get('/get/user')
@auth_required('token')
def getUser():
    user = current_user
    if user.flagged:
        return jsonify({"flagged":True}),200
    return jsonify({"flagged":False}),200




@app.get('/get/categories')
@auth_required('token')
def getCategories():
    try:
        campCats = CampCategory.query.all()
        categories=[]
        for campCat in campCats:
            categories.append(campCat.name)
        return jsonify({"success":True,"categories":categories}),200
    except:
        return jsonify({"message":"Unable to read data","success":False}),404




#  <-----------------------------------Influencer Routes------------------------------------->




@app.get("/get/influencer")
@auth_required('token')
def getInfluencer():
    user = current_user
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    total_ratings = influencer.total_ratings
    ratings_no = influencer.no_of_ratings
    avg = 0
    if ratings_no:
        avg = total_ratings/ratings_no
    result = {
        "id" : influencer.id,
        "name" : influencer.name,
        "category" : influencer.category,
        "followers" : influencer.followers,
        "platform" : influencer.platform,
        "niche" : influencer.niche,
        "description" : influencer.description,
        "earnings" : influencer.earnings,
        "no_of_ratings" : influencer.no_of_ratings,
        "average_ratings" : round(avg,1)
    }
    return jsonify(result) , 200

@app.put("/update/influencer")
@auth_required('token')
def updateInfluencer():
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't update your profile."}),400
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    name = data.get('name',None)
    category = data.get('category',None)
    platform = data.get('platform',None)
    niche = data.get('niche',None)
    followers = data.get('followers',0)
    description = data.get('description',None)
    try:
        category = category.upper()
        campCat = CampCategory.query.filter_by(name=category).first()
        if not campCat:
            campCategory = CampCategory(name=category)
            db.session.add(campCategory)
            db.session.commit()
        influencer.name = name
        influencer.category = category
        influencer.platform = platform
        influencer.niche = niche 
        influencer.followers = followers
        influencer.description = description
        db.session.commit()
        return jsonify({'success':True})
    except: 
        db.session.rollback()
        return jsonify({'success':False})



@app.get("/get/accepted/ads/list")
@auth_required('token')
def getAcceptedAdsList():
    user = current_user
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    try:
        ads = Ad.query.filter_by(inf_id=influencer.id).all()
        ads_list = []
        for ad in ads:
            if ad.status=="accepted":
                camp = Camp.query.get(ad.camp_id)
                spon_id = camp.spon_id
                sponsor = Sponsor.query.get(spon_id)
                ads_list.append({
                    "id" : ad.id,
                    "terms" : ad.terms,
                    "inf_msg" : ad.inf_messages,
                    "spon_msg" : ad.spon_messages,
                    "payment" : ad.payment,
                    "spon_name" : sponsor.name,
                    "camp_name" : camp.name,
                    "flagged" : ad.flagged,
                })
        return jsonify({"success":True,"ads":ads_list}),200
    except:
        return jsonify({"message":"Something went wrong","success":False}),404

@app.get("/get/requested/ads/list")
@auth_required('token')
def getRequestedAdsList():
    user = current_user
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    try: 
        ads = Ad.query.filter_by(inf_id=influencer.id,flagged=False).all()
        ads_list = []
        for ad in ads:
            if ad.status=="pending" and not ad.flagged:
                camp_name = ad.camp.name
                spon_name = ad.camp.sponsor.name
                inf_name = ad.influencer.name
                ads_list.append({
                    "id" : ad.id,
                    "terms" : ad.terms,
                    "inf_msg" : ad.inf_messages,
                    "spon_msg" : ad.spon_messages,
                    "payment" : ad.payment,
                    "inf_name" : inf_name,
                    "spon_name" : spon_name,
                    "camp_name" : camp_name,
                })
        return jsonify({"success":True,"ads":ads_list}),200
    except:
        return jsonify({"message":"Something went wrong","success":False}),404


@app.put("/update/ad/status/<int:id>")
@auth_required('token')
def updateAdStatus(id):
    user = current_user
    if user.flagged:
        return jsonify({"message":"You're flagged. Can't accept or reject ad."}),400
    data = request.get_json()
    status = data.get('status')
    ad_id = data.get('ad_id')
    if id==ad_id:
        ad = Ad.query.get(id)
        ad.status = status
        db.session.commit()
        result = {"message" : "Ad updated successfully"}
        return jsonify(result)
    else:
        db.session.rollback()
        result = {"message" : "Unable to update ad. Please try again."}
        return jsonify(result)

@app.put("/update/ad/inf/message/<int:id>")
@auth_required('token')
def updateAdMessage(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't negotiate right now."}),400
    data = request.get_json()
    ad = Ad.query.get(id)
    inf_message = data.get('message')
    ad.inf_messages = inf_message
    db.session.commit()
    result = {"message" : "Negotiation request sent successfully"}
    return jsonify(result)


@app.get("/get/public/camps")
@auth_required('token')
def getPublicCamps():
    all_camps = Camp.query.all()
    public_camps = []
    for camp in all_camps:
        if camp.visibility:
            public_camps.append(camp)
    camps =[]
    for camp in public_camps:
        result = {
            "id" : camp.id,
            "name" : camp.name,
            "goal" : camp.goal,
            "category" : camp.category,
            "start_date" : camp.start_date,
            "end_date" : camp.end_date,
            "budget" : camp.budget,
            "spon_name" : camp.sponsor.name,
            "spon_id" : camp.spon_id,
            "description" : camp.description,
        }
        camps.append(result)
    return jsonify({"camps":camps,"success":True}),200

@app.get('/get/interest/camp')
@auth_required('token')
def getInterest():
    try:
        user = current_user
        influencer = Influencer.query.filter_by(user_id=user.id).first()
        intCamps = InterestedCamp.query.filter_by(inf_id=influencer.id).all()
        data = []
        for intCamp in intCamps:
            result = {
                "id": intCamp.id,
                "camp_name": intCamp.camp.name,
                "spon_name" : intCamp.camp.sponsor.name,
            }
            data.append(result)
        return jsonify({"success":True,"intCamps":data}),200
    except:
        return jsonify({"success":False,"message":"Please try again later."}),401


@app.post('/show/interest/camp/<int:id>')
@auth_required('token')
def showInterest(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't show interest."}),400
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    message = data.get('message')
    try:
        camp = Camp.query.get(id)
        if camp.flagged:
            return jsonify({"message":"The campaign is flagged, you can't show interest.","success":False})
        interest = InterestedCamp(message = message,inf_id=influencer.id,camp_id=id)
        db.session.add(interest)
        db.session.commit()
        return jsonify({"message":"Your interest sent successfully","success":True}),200
    except:
        return jsonify({"message":"Error while sending interest","success":False}),401


@app.delete('/hide/interest/camp/<int:id>')
@auth_required('token')
def hideInterest(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't hide your interest."}),400
    try:
        intCamp = InterestedCamp.query.get(id)
        db.session.delete(intCamp)
        db.session.commit()
        return jsonify({"success":True,"message":"Your interest hide successfully"}),200
    except:
        db.session.rollback()
        return jsonify({"success":False,"message":"Error hiding your interest"}),401


@app.put('/withdraw/influencer')
@auth_required('token')
def withdrawInfluencer():
    data = request.get_json()
    user = current_user
    if user.flagged: 
        return jsonify({"success":False,"message":"You're flagged. You can't withdraw."}),400
    amount = data.get("amount")
    password = data.get("password")
    if not verify_password(password,user.password):
        return jsonify({"success":False,"message":"Please check your password and try again later."}),400
    influencer = Influencer.query.filter_by(user_id=user.id).first()
    try:
        if (influencer.earnings == 0) or (influencer.earnings < int(amount)):
            return jsonify({"success":False,"message":"You don't have enough earnings ."}),400
        influencer.earnings -= int(amount)
        db.session.commit()
        return jsonify({"success":True,"message":"Withdraw successful. Thank you for using our service"}),200
    except:
        db.session.rollback()
        return jsonify({"success":False,"message": "Unable to reach. Please try again later."}),400





#  <------------------------------------Sponsor Routes------------------------------------------>





@app.get("/get/influencers")
@auth_required('token')
def getInfluencers():
    try:
        influencers = Influencer.query.all()
        influencers_list = []
        for influencer in influencers:
            if not influencer.user.flagged:
                ratings = 0
                if not influencer.no_of_ratings==0:
                    ratings = influencer.total_ratings/influencer.no_of_ratings
                    ratings = round(ratings,1)
                influencers_list.append({
                    "id": influencer.id,
                    "name" : influencer.name,
                    "niche" : influencer.niche,
                    "category" : influencer.category,
                    "followers" : influencer.followers,
                    "platform" : influencer.platform,
                    "no_of_ratings": influencer.no_of_ratings,
                    "ratings" : ratings,
                    "description" : influencer.description,
                })
        return jsonify({"success":True,"influencers":influencers_list}), 200
    except:
        return jsonify({"success":False,"message":"Unable to fetch influencers' data."}),400

@app.put('/submit/influencer/rating/<int:id>')
@auth_required('token')
def submitRatings(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't submit rating."}),400
    influencer = Influencer.query.get(id)
    data = request.get_json()
    rating = data.get('rating')
    rating = int(rating)
    try:
        influencer.total_ratings += rating
        influencer.no_of_ratings += 1
        db.session.commit()
        return jsonify({"success":True,"message":"Rating submitted successfully"}),200
    except:
        return jsonify({"success":False,"message":"Error occured while submitting rating"}),400


@app.put('/pay/influencer')
@auth_required('token')
def payInfluencer():
    data = request.get_json()
    amount = data.get("amount")
    password = data.get("password")
    user = current_user
    sponsor= Sponsor.query.filter_by(user_id=user.id).first()
    if sponsor.budget == 0 or sponsor.budget < int(amount) : 
        return jsonify({"success":False,"message":"You don't have enough wallet balance(budget)."})
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't pay now."}),400
    influencer_id = data.get("inf_id")
    if not verify_password(password,user.password):
        return jsonify({"success":False,"message":"Please check your password and try again later."}),400
    influencer = Influencer.query.get(influencer_id)
    try:
        influencer.earnings += int(amount)
        sponsor.budget -= int(amount)
        db.session.commit()
        return jsonify({"success":True,"message":"Payment successful. Thank you for using our service"}),200
    except:
        db.session.rollback()
        return jsonify({"success":False,"message": "Unable to reach. Please try again later."}),400


@app.get("/get/sponsor/camps")
@auth_required('token')
def getSponsorCamps():
    user = current_user
    sponsor = Sponsor.query.filter_by(user_id=user.id).first()
    camps  = Camp.query.filter_by(spon_id=sponsor.id).all()
    categories = CampCategory.query.all()
    cats = []
    visibility=""
    for category in categories:
        cats.append(category.name)
    camp_list =[]
    for camp in camps:
        if camp.visibility==True:
            visibility = "Public"
        else:
            visibility="Private"
        result = {
            "id" : camp.id,
            "name" : camp.name,
            "goals" : camp.goal,
            "budget" : camp.budget,
            "category" : camp.category,
            "start_date" : camp.start_date,
            "end_date" : camp.end_date,
            "description" : camp.description,
            "visibility" : visibility,
            "flagged" : camp.flagged,
        }
        camp_list.append(result)
    return jsonify({"camps" : camp_list,"categories" : cats}),200

@app.post("/create/camp")
@auth_required('token')
def createCamp():
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't create campaign."}),400
    sponsor = Sponsor.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    name = data.get("name",None)
    goals = data.get("goals",None)
    budget = data.get("budget",None)
    category = data.get("category",None)
    start_date = data.get("start_date",None)
    end_date = data.get("end_date",None)
    if start_date and end_date:
        start_date=datetime.strptime(start_date, '%Y-%m-%d')
        end_date=datetime.strptime(end_date, '%Y-%m-%d')
    visibility = data.get('visibility',False)
    description = data.get('description')
    if visibility=="Public":
        visibility = True
    else:
        visibility = False
    try:
        camp = Camp(name=name,goal=goals,budget=budget,category=category,start_date=start_date,end_date=end_date,visibility=visibility,description=description,spon_id=sponsor.id)
        db.session.add(camp)
        db.session.commit()
        return jsonify({"success":True,"message":"Camp has created successfully"}),201
    except:
        db.session.rollback()
        return jsonify({"success":False,"message":"Failed while creating camp"}),500

@app.put("/update/camp/<int:id>")
@auth_required('token')
def updateCamp(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't update campaign."}),400
    camp = Camp.query.get(id)
    data = request.get_json()
    name = data.get("name")
    goals = data.get("goals")
    budget = data.get("budget")
    category = data.get("category")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    start_date=datetime.strptime(start_date, '%Y-%m-%d')
    end_date=datetime.strptime(end_date, '%Y-%m-%d')
    visibility = data.get('visibility')
    description = data.get('description')
    if visibility=="Public":
        visibility = True
    else:
        visibility = False
    try:
        camp.name = name
        camp.goal = goals
        camp.budget = budget
        camp.visibility = visibility
        camp.category = category
        camp.start_date = start_date
        camp.end_date = end_date
        camp.description = description
        db.session.commit()
        return jsonify({"success":True,"message":"Camp has been updated successfully"}),201
    except:
        db.session.rollback()
        return jsonify({"success":False,"message":"Problem occurred while updating camp"}),405
    
@app.delete("/delete/camp/<int:id>")
@auth_required('token')
def deleteCamp(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't delete campaign."}),400
    camp = Camp.query.get(id)
    ads = Ad.query.filter_by(camp_id=camp.id).all()
    intCamps = InterestedCamp.query.filter_by(camp_id=camp.id).all()
    try:
        for ad in ads:
            db.session.delete(ad)
            db.session.commit()
        for intCamp in intCamps:
            db.session.delete(intCamp)
            db.session.commit()
        db.session.delete(camp)
        db.session.commit()
        return jsonify({"success":True,"message":"Camp has deleted successfully"}),200
    except:
        db.session.rollback()
        return jsonify({"success":False,"message":"Error while deleting camp"})


@app.get('/get/sponsor/ads/<status>')
@auth_required('token')
def getSponsorAdsStatus(status):
    user = current_user
    spon = Sponsor.query.filter_by(user_id=user.id).first()
    camps = Camp.query.filter_by(spon_id=spon.id).all()
    data = []
    if status=='all':
        for camp in camps:
            allAds = Ad.query.filter_by(camp_id=camp.id).all()
            for ad in allAds:
                newResult = {
                    "id" : ad.id,
                    "terms" : ad.terms,
                    "status" : ad.status,
                    "inf_msg" : ad.inf_messages,
                    "spon_msg" : ad.spon_messages,
                    "payment" : ad.payment,
                    "camp_name" : ad.camp.name,
                    "camp_id" : ad.camp.id,
                    "inf_name" : ad.influencer.name,
                    "inf_id" : ad.influencer.id,
                    "flagged" : ad.flagged,
                }
                data.append(newResult)
    else:
        for camp in camps:
            ads = Ad.query.filter_by(camp_id=camp.id,status=status).all()
            for ad in ads:
                result = {
                    "id" : ad.id,
                    "terms" : ad.terms,
                    "status" : ad.status,
                    "inf_msg" : ad.inf_messages,
                    "spon_msg" : ad.spon_messages,
                    "payment" : ad.payment,
                    "camp_name" : ad.camp.name,
                    "camp_id" : ad.camp_id,
                    "inf_name" : ad.influencer.name,
                    "inf_id" : ad.inf_id,
                    "flagged" : ad.flagged
                }
                data.append(result)
    return jsonify({"success":True,"ads":data}),200


@app.post('/create/ad')
@auth_required('token')
def createAd():
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't create ad."}),400
    spon = Sponsor.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    camp_id = data.get('camp_id')
    inf_id = data.get('inf_id')
    terms = data.get('terms')
    payment = data.get('payment')
    status = 'pending'
    camp = Camp.query.get(camp_id)
    if spon.id != camp.spon_id:
        return jsonify({"message":"You are not the creator of the campaign. Please use different campaign id","success":False}),403
    if not camp.visibility:
        return jsonify({"message":"Can't create ad for private campaign.","success":False}),400
    influencer = Influencer.query.get(inf_id)
    if influencer.user.flagged:
        return jsonify({"message":"The influencer is flagged. You can't offer ad.","success":False}),400
    try:
        ad = Ad(terms=terms,status=status,payment=payment,camp_id=camp_id,inf_id=inf_id)
        db.session.add(ad)
        db.session.commit()
        return jsonify({"message":"Ad has been created successfully","success":True}),201
    except:
        db.session.rollback()
        return jsonify({"message":"Error occured while creating ad","success":False}),401
    
@app.put('/update/ad/<int:id>')
@auth_required('token')
def updateAd(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't update ad."}),400
    spon = Sponsor.query.filter_by(user_id=user.id).first()
    ad = Ad.query.get(id)
    data = request.get_json()
    camp_id = data.get('camp_id')
    inf_id = data.get('inf_id')
    terms = data.get('terms')
    payment = data.get('payment')
    camp = Camp.query.get(camp_id)
    if spon.id != camp.spon_id:
        return jsonify({"message":"You are not the creator of the campaign. Please use different campaign id","success":False}),403
    if ad.status=="accepted":
        return jsonify({"message":"Can't update already accepted ad's fields.","success":False}),400
    if ad.status=="rejected":
        return jsonify({"message":"Can't update already rejected ad's fields.","success":False}),400
    try:
        ad.camp_id = camp_id
        ad.inf_id = inf_id
        ad.terms = terms
        ad.payment = payment
        db.session.commit()
        return jsonify({"message":"Ad has been updated successfully","success":True}),201
    except:
        db.session.rollback()
        return jsonify({"message":"Error occured while updating ad","success":False}),401
    

@app.delete('/delete/ad/<int:id>')
@auth_required('token')
def deleteAd(id):
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You're flagged. Can't delete ad."}),400
    ad = Ad.query.get(id)
    try:
        db.session.delete(ad)
        db.session.commit()
        return jsonify({"message":"Ad has benn deleted successfully","success":True}),201
    except:
        db.session.rollback()
        return jsonify({"message":"Error while deleting ad","success":False}),401


@app.put("/update/ad/spon/message/<int:id>")
@auth_required('token')
def updateAdMessageSpon(id):
    user = current_user
    if user.flagged:
        return jsonify({'message':'You are flagged. Can\'t negotiate.'}),400
    data = request.get_json()
    ad = Ad.query.get(id)
    spon_message = data.get('message')
    ad.spon_messages = spon_message
    db.session.commit()
    result = {"message" : "Negotiation request sent successfully"}
    return jsonify(result),200


@app.get('/get/sponsor')
@auth_required('token')
def getSponsor():
    user = current_user
    sponsor = Sponsor.query.filter_by(user_id=user.id).first()
    result = {
        "name" : sponsor.name,
        "company_name" : sponsor.company_name,
        "industry" : sponsor.industry,
        "budget" : sponsor.budget,
        "description" : sponsor.description,
    }
    return jsonify({"success" : True, "profile" : result}),200

@app.put('/update/sponsor')
@auth_required('token')
def updateSponsor():
    user = current_user
    if user.flagged:
        return jsonify({"success":False,"message":"You are flagged. Can'nt update your profile data."}),400
    sponsor = Sponsor.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    name = data.get('name',None)
    company_name = data.get('company_name',None)
    industry = data.get('industry',None)
    budget = data.get('budget',0)
    description = data.get('description')
    try:
        sponsor.name = name
        sponsor.company_name = company_name
        sponsor.industry = industry
        sponsor.budget = budget
        sponsor.description = description
        db.session.commit()
        return jsonify({"message":"Your profile updated successfully","success":True}),201
    except:
        db.session.rollback()
        return jsonify({"message":"Error updating your profile","success":False})

@app.get('/get/interest/camp/sponsor')
@auth_required('token')
def getSponsorInterest():
    try:
        user = current_user
        spon = Sponsor.query.filter_by(user_id=user.id).first()
        camps = Camp.query.filter_by(spon_id=spon.id).all()
        data = []
        for camp in camps:
            intCamps = InterestedCamp.query.filter_by(camp_id=camp.id).all()
            for intCamp in intCamps:
                print(intCamp.camp.name)
                result = {
                    "id": intCamp.id,
                    "camp_name": intCamp.camp.name,
                    "inf_name" : intCamp.influencer.name,
                    "inf_id": intCamp.influencer.id
                }
                print(result)
                data.append(result)
        return jsonify({"success":True,"intCamps":data}),200
    except:
        return jsonify({"success":False,"message":"Error fetching data for this page."}),400


@app.get('/create/csv')
@auth_required('token')
def createCsv():
    user = current_user
    sponsor = Sponsor.query.filter_by(user_id=user.id).first()
    id = sponsor.id
    task = create_csv.delay(id)
    return jsonify({"task_id":task.id,"success":True}),200

@app.get('/get/csv/<task_id>')
def getCsv(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        return send_file(f'./backend/celery/user_downloads/{result.result}',as_attachment=True),200
    else:
        return jsonify({"message":"task is not ready"}),102




    
#  <-------------------------------------Admin Routes-------------------------------------------->





@app.get("/get/sponsors/list")
@auth_required('token')
def getSponsorsList():
    try:
        sponsors = Sponsor.query.all()
        sponsor_list = []
        for sponsor in sponsors:
            sponsor_list.append({
                "id": sponsor.id,
                "name" : sponsor.name,
                "role" : "sponsor",
                "company_name": sponsor.company_name,
                "industry" : sponsor.industry,
                "budget" : sponsor.budget,
                "flagged": sponsor.user.flagged,
            })
        return jsonify({"success":True,"sponsors":sponsor_list}), 200
    except:
        return jsonify({"success":False,"message":"Unable to fetch sponsors' data"})


@app.get("/get/influencers/list")
@auth_required('token')
def getInfluencerList():
    try:
        influencers = Influencer.query.all()
        influencers_list = []
        for influencer in influencers:
            ratings = 0
            if not influencer.no_of_ratings==0:
                ratings = influencer.total_ratings/influencer.no_of_ratings
                ratings = round(ratings,1)
            influencers_list.append({
                "id": influencer.id,
                "name" : influencer.name,
                "role" : "influencer",
                "category" : influencer.category,
                "followers" : influencer.followers,
                "platform" : influencer.platform,
                "ratings" : ratings,
                "flagged" : influencer.user.flagged,
            })
        return jsonify({"success":True,"influencers":influencers_list}), 200
    except:
        return jsonify({"success":False,"message":"Unable to fetch influencers' data."}),400


@app.put("/flag/user/<int:id>")
@auth_required('token')
def flagUser(id):
    data = request.get_json()
    role = data.get('role')
    flagged = data.get('flagged')
    try:
        flagged = bool(flagged)
        if role=='sponsor':
            sponsor = Sponsor.query.get(id)
            sponsor.user.flagged = flagged
            db.session.commit()
        elif role=='influencer':
            influencer = Influencer.query.get(id)
            influencer.user.flagged = flagged
            db.session.commit()
        return jsonify({"message":"User is flagged successfully","success":True}),200
    except:
        db.session.rollback()
        return jsonify({"message":"Error while flagging the user","success":False}),400
    


@app.put("/unflag/user/<int:id>")
@auth_required('token')
def unflagUser(id):
    data = request.get_json()
    role = data.get('role')
    flagged =data.get('flagged')
    try:
        flagged = bool(flagged)
        if role=='sponsor':
            sponsor = Sponsor.query.get(id)
            sponsor.user.flagged = flagged
            db.session.commit()
        elif role=='influencer':
            influencer = Influencer.query.get(id)
            influencer.user.flagged = flagged
            db.session.commit()
        return jsonify({"message":"User is unflagged successfully","success":True}),200
    except:
        db.session.rollback()
        return jsonify({"message":"Error while unflagging the user","success":False}),400



@app.get("/get/camps/list")
@auth_required('token')
def getCampsList():
    camps = Camp.query.all()
    camps_list =[]
    for camp in camps:
        ads = Ad.query.filter_by(camp_id=camp.id).all()
        visibility = ""
        if camp.visibility:
            visibility = "Public"
        else:
            visibility = "Private"
        camps_list.append({
            "id" : camp.id,
            "name" : camp.name,
            "sponsor_name": camp.sponsor.name,
            "goal" : camp.goal,
            "visibility" : visibility,
            "category" : camp.category,
            "flagged" : camp.flagged,
            "description" : camp.description,
            "no_of_ads" : len(ads)
        })
    return jsonify({"success":True,"camps":camps_list}) , 200


@app.put('/flag/camp/<int:id>')
@auth_required('token')
def flagCamp(id):
    camp = Camp.query.get(id)
    data = request.get_json()
    flagged = data.get('flagged')
    ads = Ad.query.filter_by(camp_id=camp.id).all()
    try:
        camp.flagged = bool(flagged)
        for ad in ads:
            ad.flagged = bool(flagged)
            db.session.commit()
        return jsonify({"success":True}),200
    except:
        db.session.rollback()
        return jsonify({"success":False}),400
    

@app.put('/unflag/camp/<int:id>')
@auth_required('token')
def unflagCamp(id):
    camp = Camp.query.get(id)
    data = request.get_json()
    flagged = data.get('flagged')
    ads = Ad.query.filter_by(camp_id=camp.id).all()
    try:
        camp.flagged = bool(flagged)
        for ad in ads:
            ad.flagged = bool(flagged)
            db.session.commit()
        return jsonify({"success":True}),200
    except:
        db.session.rollback()
        return jsonify({"success":False}),400


@app.post('/create/category')
@auth_required('token')
def createCategory():
    data = request.get_json()
    categoryName = data.get('name')
    categoryName = categoryName.upper()
    campCategory = CampCategory(name=categoryName)
    try:
        db.session.add(campCategory)
        db.session.commit()
        return jsonify({"success":True,"message":"Category created succefully"}),200
    except:
        db.session.rollback()
        return jsonify({'success':False,'message':'Unable to create category. Please check your inputs.'}),400


@app.put('/update/category/<int:id>')
@auth_required('token')
def updateCategory(id):
    data = request.get_json()
    categoryName = data.get('name')
    categoryName = categoryName.upper()
    campCategory = CampCategory.query.get(id)
    try:
        campCategory.name = categoryName
        db.session.commit()
        return jsonify({"success":True,"message":"Category updated succefully"}),200
    except:
        db.session.rollback()
        return jsonify({'success':False,'message':'Unable to update category. Please check your inputs.'}),400

@app.get('/get/admin/category')
@auth_required('token')
def getAdminCategory():
    categories = CampCategory.query.all()
    cat_list = []
    for category in categories:
        camps = Camp.query.filter_by(category=category.name).all()
        cat_list.append({
            "id" : category.id,
            "name" : category.name,
            "no_of_campaigns" : len(camps)
        })
    return jsonify({"success":True,"categories":cat_list}),200

@app.delete('/delete/category/<int:id>')
@auth_required('token')
def deleteCategory(id):
    category = CampCategory.query.get(id)
    try:
        
        db.session.delete(category)
        db.session.commit()
        return jsonify({"success":True,"message":"Deleted successfully"}),200
    except:
        db.session.rollback()
        return jsonify({"success":False,"message":"Unable to delete category."}),400


@app.get('/admin/summary')
@auth_required('token')
def getSummary():
    influencers = Influencer.query.all()
    sponsors = Sponsor.query.all()
    campaigns = Camp.query.all()
    ads = Ad.query.all()
    influencers_count = len(influencers)
    flagged_influencers_count = 0
    sponsors_count = len(sponsors)
    flagged_sponsors_count = 0
    campaigns_count =len(campaigns)
    flagged_campaigns_count = 0 
    accepted = 0
    rejected = 0
    pending = 0
    flagged = 0
    try:
        for influencer in influencers:
            if influencer.user.flagged: 
                flagged_influencers_count += 1
        for sponsor in sponsors:
            if sponsor.user.flagged: 
                flagged_sponsors_count += 1
        for campaign in campaigns:
            if campaign.flagged: 
                flagged_campaigns_count += 1
        for ad in ads:
            if ad.flagged: 
                flagged += 1
            if ad.status == 'accepted':
                accepted += 1
            elif ad.status == 'rejected':
                rejected += 1
            elif ad.status == 'pending':
                pending += 1
        result = {
            "influencers_count" : influencers_count,
            "flagged_influencers_count" : flagged_influencers_count,
            "sponsors_count" : sponsors_count,
            "flagged_sponsors_count" : flagged_sponsors_count,
            "campaigns_count" : campaigns_count,
            "flagged_campaigns_count" : flagged_campaigns_count,
            "ads" : {
                "accepted" : accepted,
                "rejected" : rejected,
                "pending" : pending,
                "flagged" : flagged
            }
        }
        return jsonify({"success":True,"summary":result}),200
    except:
        return jsonify({"success":False}),400


