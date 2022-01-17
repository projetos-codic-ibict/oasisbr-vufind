<?php

namespace Oasisbr\Controller;

class AboutController extends \VuFind\Controller\AbstractBase
{

  public function homeAction()
  {
    return $this->createViewModel();
  }
}
