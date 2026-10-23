<?php
require 'config.php';header('Content-Type: application/json');
$T=['seasons'=>['name'],'teams'=>['name','color'],'drivers'=>['name','number','team_id'],'races'=>['season_id','name','circuit','race_date','has_sprint']];
$p=null;
try{$p=db();$m=$_SERVER['REQUEST_METHOD'];$t=$_GET['t']??'';
if($m=='GET'){$o=[];foreach(['seasons','teams','drivers','races','results','scoring'] as $x)$o[$x]=$p->query("SELECT * FROM $x ORDER BY 1")->fetchAll();echo json_encode($o);exit;}
if($m=='DELETE'){if(!isset($T[$t]))throw new Exception('Table inconnue');$p->prepare("DELETE FROM $t WHERE id=?")->execute([$_GET['id']]);echo '{"ok":1}';exit;}
$b=json_decode(file_get_contents('php://input'),true);$t=$b['t']??'';
if($t=='results'){$p->beginTransaction();$p->prepare("DELETE FROM results WHERE race_id=? AND kind=?")->execute([$b['race_id'],$b['kind']]);
 $s=$p->prepare("INSERT INTO results(race_id,kind,position,driver_id,team_id) VALUES(?,?,?,?,?)");
 foreach($b['rows'] as $r)$s->execute([$b['race_id'],$b['kind'],$r['position'],$r['driver_id'],$r['team_id']?:null]);
 $p->commit();echo '{"ok":1}';exit;}
if($t=='scoring'){$p->beginTransaction();$p->exec("DELETE FROM scoring");
 $s=$p->prepare("INSERT INTO scoring(kind,position,points) VALUES(?,?,?)");
 foreach($b['rows'] as $r)$s->execute([$r['kind'],$r['position'],$r['points']]);
 $p->commit();echo '{"ok":1}';exit;}
if(!isset($T[$t]))throw new Exception('Table inconnue');
$d=[];foreach($T[$t] as $c)if(array_key_exists($c,$b['data']))$d[$c]=$b['data'][$c];
if(!empty($b['id'])){$set=implode(',',array_map(fn($c)=>"$c=?",array_keys($d)));$p->prepare("UPDATE $t SET $set WHERE id=?")->execute([...array_values($d),$b['id']]);}
else{$p->prepare("INSERT INTO $t(".implode(',',array_keys($d)).") VALUES(".implode(',',array_fill(0,count($d),'?')).")")->execute(array_values($d));}
echo '{"ok":1}';
}catch(Throwable $e){if($p&&$p->inTransaction())$p->rollBack();http_response_code(500);echo json_encode(['error'=>$e->getCode()=='23000'?'Valeur déjà utilisée ou donnée liée (doublon)':$e->getMessage()]);}
