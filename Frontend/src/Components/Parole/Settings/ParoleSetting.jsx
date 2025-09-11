import { Box } from '@mui/system';
import { Helmet } from 'react-helmet';
import PayroleNosForm from './ParoleNosForm';

const ParoleSetting = () => {
    return (
        <>
            <Helmet>
                <title>PMIS: प्यारोल Setting</title>
                <meta name="description" content="प्यारोल सम्बन्धि फारम भर्नुहोस्" />
                <meta name="keywords" content="प्यारोल, फारम, कैदी, कैदी विवरण, कैदी रेकर्ड" />
                <meta name="author" content="कारागार व्यवस्थापन विभाग" />
            </Helmet>
            <Box sx={{ flexGrow: 1 }}>
                <PayroleNosForm/>
            </Box>
        </>
    );
};

export default ParoleSetting;
