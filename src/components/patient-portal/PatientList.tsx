import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Phone, MapPin, MessageCircle, CreditCard } from "lucide-react";
import { Patient } from "@/integrations/supabase/schema";

interface PatientListProps {
  patients: Patient[];
  onSelectPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient = () => {},
  onEditPatient = () => {},
}) => {
  return (
    <div className="space-y-4">
      {patients.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">ไม่พบข้อมูลผู้ป่วย</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in"
              onClick={() => onSelectPatient(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-pharmacy-100 flex items-center justify-center mr-3">
                      {patient.profile_image ? (
                        <img
                          src={patient.profile_image}
                          alt={patient.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-pharmacy-500 font-semibold">
                          {patient.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {patient.name}
                      </h4>
                      {patient.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.ID_card && (
                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {patient.ID_card}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-pharmacy-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPatient(patient);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {patient.line_id && (
                    <div className="flex items-center text-gray-500">
                      <MessageCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                      LINE: {patient.line_id}
                    </div>
                  )}

                  {patient.address && (
                    <div className="flex items-start text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 text-pharmacy-500" />
                      <span className="line-clamp-2">{patient.address}</span>
                    </div>
                  )}

                  {patient.distance_from_hospital !== undefined &&
                    patient.distance_from_hospital !== null && (
                      <div className="text-xs text-gray-400 mt-2">
                        ระยะห่างจากโรงพยาบาล: {patient.distance_from_hospital}{" "}
                        กม.
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
