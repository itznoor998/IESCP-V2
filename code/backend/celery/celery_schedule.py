
from datetime import datetime, timedelta
from celery.schedules import crontab
from flask import current_app as app
from backend.celery.task import send_reminder, send_report
from backend.models import Ad, Camp, Influencer, Sponsor


celery_app = app.extensions["celery"]


@celery_app.on_after_configure.connect
def setup_daily_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=19),send_daily_reminders.s()) #send reminder at evening 7pm
    print("executing daily scheduler")


    
@celery_app.task
def send_daily_reminders():
    all_influencers = Influencer.query.all()
    influencers = []
    for influencer in all_influencers:
        if influencer.user.last_login < datetime.now() - timedelta(days=1):
            influencers.append(influencer)


    for influencer in influencers:
        send_reminder(influencer)
    print("Daily reminder has done")



@celery_app.on_after_configure.connect
def setup_monthly_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(day_of_month='7',hour=7),send_monthly_reminders.s()) #each month on day 7 at 7pm
    print("executing monthly scheduler")


    
@celery_app.task
def send_monthly_reminders():
    all_sponsors = Sponsor.query.all()

    for sponsor in all_sponsors:
        campaigns = Camp.query.filter_by(spon_id=sponsor.id).all()
        campaign_info = []
        total_no_ads = 0
        total_expense = 0

        for campaign in campaigns:
            ads = Ad.query.filter_by(camp_id=campaign.id).all()
            ads_count = len(ads)
            expense = sum(ad.payment for ad in ads)
            total_no_ads += ads_count
            total_expense += expense

            campaign_info.append({
                'name': campaign.name,
                'no_ads': ads_count,
                'expense': expense,
                'budget': campaign.budget,
                'remaining_budget': campaign.budget - expense,
            })
            sponsor_details = {
                "sponsor_name":sponsor.name,
                "sponsor_email":sponsor.user.email,
                "campaign_info":campaign_info,
                "total_expense":total_expense,
                "total_no_ads":total_no_ads,
            }

        send_report(sponsor_details)
    print("Monthly reminder has done")




