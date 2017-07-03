<?php
/**
 * Created by PhpStorm.
 * User: Baka Killer
 * Date: 22/06/2017
 * Time: 19:30
 */

$newgifs = $_POST['newgifs'];
$cat = $_POST['cat'];

$waitinggifs = (array)json_decode(file_get_contents('../waitinggifs.json'));
$gifs = (array)json_decode(file_get_contents('../gifs.json'));
$cats = (array)json_decode(file_get_contents('../cats.json'));

if (!in_array($cat, $cats)) {
    echo "Toi t'as essayé de tricher èé Heureusement, je suis magnanime. Allez, joue la honnêtement et propose une nouvelle catégorie si celle-là n'existe pas ^^";
    exit;
}
if (empty($gifs[$cat])) {
    $catgifs[$cat] = array();
}
$catgifs = $gifs[$cat];
if (empty($waitinggifs[$cat])) {
    $waitinggifs[$cat] = array();
}
$catwaitinggifs = $waitinggifs[$cat];
$newgifs = str_replace("\r\n", "\n", $newgifs);
$newgifs = str_replace("\r", "\n", $newgifs);
$newgifs = explode("\n", $newgifs);
foreach ($newgifs as $newgif) {
    $newgif = trim($newgif);
    if (!in_array($newgif, $catgifs) && !in_array($newgif, $catwaitinggifs)) {
        $waitinggifs[$cat][] = $newgif;
    }
}

if (file_put_contents('../waitinggifs.json', str_replace('\\', '', json_encode($waitinggifs)))) {
    echo "Votre demande a été enregistrée !";
} else {
    echo "Il y a eu un problème ! Contactez le gestionnaire du bot pour le lui signaler !";
}