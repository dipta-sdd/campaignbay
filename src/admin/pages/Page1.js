import apiFetch  from '@wordpress/api-fetch';
import { Button } from '@wordpress/components';


export default function Page1() {
  const handleClick = () => {
    console.log('Button clicked!');
    apiFetch({ path: '/wpab-cb/v1/settings'}).then((settings) => {
          console.log(settings);
          // alert('Settings fetched successfully!');
        });
  };
  return (
    <div>
      <h1>Page 1</h1>
      <p>This is the content of Page 1.</p>
      <Button onClick={ handleClick} variant="primary">
        click
      </Button>
    </div>
  );
}