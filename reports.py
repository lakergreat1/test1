from pydantic import BaseModel, Field
from typing import Optional
from narrative_guidelines import general_guideline, crown_brief_guideline, general_occurrence_guideline

class PersonDetails(BaseModel):
    surname: str
    given_1: str
    given_2: Optional[str]
    sex_type: str
    date_of_birth: str

class PersonAddress(BaseModel):
    house_or_building_number: str
    street_address: str
    apartment_or_room_number: Optional[str]
    city_town: str
    type_of_residence: str

class ContactInfo(BaseModel):
    phone_number: str
    phone_type: str
    social_media_type: Optional[str]
    social_media_handle: Optional[str]
    email_address: Optional[str]

class ReportBase(BaseModel):
    officer_full_name_and_badge_number: str
    occurrence_number: str
    occurrence_type: str
    report_time: str
    occurrence_time: str
    persons_details: PersonDetails
    persons_address: PersonAddress
    contact_info: ContactInfo
    involvement_type: str
    narrative: str
    end_of_report_badge_number: str

class CrownBrief(ReportBase):
    narrative: str = Field(..., description=crown_brief_guideline)

class GeneralOccurrence(ReportBase):
    narrative: str = Field(..., description=general_occurrence_guideline)
