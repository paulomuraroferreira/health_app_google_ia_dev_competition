import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const devTeam = [
  {
    name: "Flávio Loução",
    linkedin: "https://www.linkedin.com/in/flavioloucao/",
  },
  {
    name: "Lucas Solano",
    linkedin: "https://www.linkedin.com/in/lucassolano/",
  },
  {
    name: "Mauricio Magalhaes",
    linkedin: "https://www.linkedin.com/in/mauriciosmag/",
  },
  {
    name: "Paulo Ferreira",
    linkedin: "https://www.linkedin.com/in/paulomuraroferreira/",
  },
];

const AboutPage = () => {
  return (
    <Box>
      <Typography component="h1" variant="h4">
        About
      </Typography>
      <Typography>
        This project was developed by the following team members:
      </Typography>

      <Box>
        <ul>
          {devTeam.map((dev) => (
            <li key={dev.name}>
              <Typography>
                <a target="_blank" href={dev.linkedin}>
                  {dev.name}
                </a>
              </Typography>
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default AboutPage;
