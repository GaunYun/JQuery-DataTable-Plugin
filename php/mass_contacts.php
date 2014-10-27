<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Administrator
 * Date: 10/22/14
 * Time: 3:38 PM
 * To change this template use File | Settings | File Templates.
 */

// get parameters
if(isset($_GET['paging_limit'])) {
    $paging_limit = intval($_GET['paging_limit']);
    if($paging_limit <= 0) {
        $paging_limit = 25;
    }
}
else {
    $paging_limit = 25;
}

if(isset($_GET['page_number'])) {
    $page_number = intval($_GET['page_number']);
    if($page_number <= 0) {
        $page_number = 0;
    }
}
else {
    $page_number = 0;
}
$skip = $page_number * $paging_limit;

if(isset($_GET['orderby'])) {
    $orderby = $_GET['orderby'];
}
else {
    $orderby = '';
}

if(isset($_GET['order'])) {
    $order = $_GET['order'];
}
else {
    $order = 'asc';
}

if($order == 'asc') {
    $sort_desc = 1;
} else {
    $sort_desc = -1;
}
if($orderby != '') {
    $sort = array(
        $orderby => $sort_desc,
    );
}
else {
    $sort = array();
}

$dbhost = 'localhost';
$dbname = 'contacts_table';
$m = new Mongo("mongodb://$dbhost");
$db = $m->$dbname;
$collection = $db->users;
$cursor = $collection->find(array('email' => array('$ne' => null)))->skip($skip)->limit($paging_limit)->sort($sort);
$num_docs = $cursor->count();

if($num_docs > 0) {
    $count = 0;
    $contacts = array();
    foreach($cursor as $obj) {
        $contacts[] = $obj;
        $count++;
    }

    $result = array(
        'total_count' => $num_docs,
        'get_count' => count($contacts),
        'contacts' => $contacts
    );
    echo json_encode($result);
}
$m->close();
exit;





