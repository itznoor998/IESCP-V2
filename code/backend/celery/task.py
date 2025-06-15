from celery import shared_task
from jinja2 import Template
from backend.celery.mail_service import send_email
from backend.models import Camp, Sponsor
import flask_excel as excel




@shared_task(ignore_task=False)
def create_csv(id):
    sponsor = Sponsor.query.get(id)
    campaigns = Camp.query.filter_by(spon_id=sponsor.id).all()

    file_name = f'IESCPV2_{sponsor.name}.csv'
    columns_name = [column.name for column in Camp.__table__.columns]
    csv_out = excel.make_response_from_query_sets(campaigns,column_names=columns_name,file_type='csv')

    with open(f'./backend/celery/user_downloads/{file_name}','wb') as file:
        file.write(csv_out.data)
    return file_name

@shared_task(ignore_task=False)
def send_reminder(influencer):
    content = f''' 
        <h2> Hi, {influencer.name} </h2>
        <h3>We hope you're doing well. We just wanted to inform you that you haven't visited our page today.</h3>
        <h4> Your last login time is {influencer.user.last_login} </h4>
        <h5>From Operation Team</h5>
    '''
    print("intialize email")
    # Send the email
    send_email(influencer.user.email,"Daily Reminder",content=content)

    print(f"Daily reminder sent to {influencer.name}")


@shared_task(ignore_task=False)
def send_report(sponsor_details):
    with open('monthly_report.html','r') as file:
        template = Template(file.read())
        content = template.render(name=sponsor_details['sponsor_name'],
                                  campaign_info=sponsor_details['campaign_info'],
                                  total_no_ads=sponsor_details['total_no_ads'],
                                  total_expense=sponsor_details['total_expense'])
        
        print("Initialize monthly email")
        #Send email
        send_email(sponsor_details['sponsor_email'],"Monthly Report",content)

    print(f"Monthly report sent to {sponsor_details['sponsor_name']}")
