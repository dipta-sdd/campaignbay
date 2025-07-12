import { useParams } from 'react-router-dom';

const CampaignsEdit = () => {
    const { id } = useParams();
    return (
        <div>
            <h1>Edit Campaign</h1>
            <p>Editing campaign with ID: {id}</p>
        </div>
    );
};

export default CampaignsEdit;
