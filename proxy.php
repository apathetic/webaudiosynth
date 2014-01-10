<?php 

if (isset($_GET['url'])) {
	$url = $_GET['url'];
} else {
	return 0;
}

$dom = file_get_contents($url);

echo $dom;
die(0);

?>