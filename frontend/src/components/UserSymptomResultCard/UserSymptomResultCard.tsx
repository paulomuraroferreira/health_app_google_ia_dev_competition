import { FC, Fragment, useMemo } from "react";
import { UserSymptoms } from "../../models/user";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export interface Props {
  symptom: UserSymptoms;
  selectedSymptom: string | null;
}

const UserSymptomResultCard: FC<Props> = ({ symptom, selectedSymptom }) => {
  const result = useMemo(() => {
    const result = symptom.result
      .map((r) => `${r.disease} (${(r.probability * 100).toFixed()}%)`)
      .join(", ");
    return result;
  }, [symptom]);

  return (
    <Fragment>
      <Typography component="h2" variant="h5">
        {new Date(symptom.created).toLocaleString()}{" "}
        {selectedSymptom === symptom._id && <Chip label="New" />}
      </Typography>
      <Typography component="p">
        {`Reported: ${symptom.symptoms.map((s) => s.name).join(", ")}`}
      </Typography>
      <Typography component="p">{`Result: ${result}`}</Typography>
    </Fragment>
  );
};

export default UserSymptomResultCard;
