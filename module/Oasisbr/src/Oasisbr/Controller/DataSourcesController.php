<?php

namespace Oasisbr\Controller;

class DataSourcesController extends \VuFind\Controller\AbstractBase
{
  public function homeAction()
  {
    return $this->createViewModel();
  }

  public function datasourceAction()
  {
    $name = $this->params()->fromQuery('name');
    $issn = $this->params()->fromQuery('issn');
    $institution = $this->params()->fromQuery('institution');
    $sourceUrl = $this->params()->fromQuery('sourceUrl');
    $sourceType = $this->params()->fromQuery('sourceType');
    $email = $this->params()->fromQuery('email');
    $validSize = $this->params()->fromQuery('validSize');
    $customClass = $this->getCustomClass($sourceType);
    // $name = 'Jesiel';
    return $this->createViewModel([
      'name' => $name,
      'issn' => $issn,
      'institution' => $institution,
      'sourceUrl' => $sourceUrl,
      'sourceType' => $sourceType,
      'email' => $email,
      'validSize' => $validSize,
      'customClass' => $customClass,
    ]);
  }

  public function  getCustomClass($sourceType)
  {
    switch ($sourceType) {
      case "Revista Científica":
        return "revista";
      case "Repositório de Publicações":
        return "repo-publicacoes";
      case "Repositório de Dados":
        return "repo-dados";
      case "Biblioteca Digital de Teses e Dissertações":
        return "biblioteca";
      default:
        return "repo";
    }
  }
}
