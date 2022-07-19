<?php

return array(
  'controllers' =>
  array(
    'factories' =>
    array(
      'Oasisbr\\Controller\\AboutController' => 'VuFind\\Controller\\AbstractBaseFactory',
      'Oasisbr\\Controller\\FaqController' => 'VuFind\\Controller\\AbstractBaseFactory',
      'Oasisbr\\Controller\\DataSourcesController' => 'VuFind\\Controller\\AbstractBaseFactory',
      'Oasisbr\\Controller\\IndicatorsController' => 'VuFind\\Controller\\AbstractBaseFactory',
      'Oasisbr\\Controller\\BulkExportController' => 'VuFind\\Controller\\AbstractBaseFactory',
    ),
    'aliases' =>
    array(
      'About' => 'Oasisbr\\Controller\\AboutController',
      'about' => 'Oasisbr\\Controller\\AboutController',
      'Faq' => 'Oasisbr\\Controller\\FaqController',
      'faq' => 'Oasisbr\\Controller\\FaqController',
      'DataSources' => 'Oasisbr\\Controller\\DataSourcesController',
      'datasources' => 'Oasisbr\\Controller\\DataSourcesController',
      'Indicators' => 'Oasisbr\\Controller\\IndicatorsController',
      'indicators' => 'Oasisbr\\Controller\\IndicatorsController',
      'BulkExport' => 'Oasisbr\\Controller\\BulkExportController',
      'bulkexport' => 'Oasisbr\\Controller\\BulkExportController',
    ),
  ),
  'router' =>
  array(
    'routes' =>
    array(
      'about-home' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/about/home',
          'defaults' =>
          array(
            'controller' => 'About',
            'action' => 'Home',
          ),
        ),
      ),
      'faq-home' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/faq/home',
          'defaults' =>
          array(
            'controller' => 'Faq',
            'action' => 'Home',
          ),
        ),
      ),
      'datasources-home' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/datasources/home',
          'defaults' =>
          array(
            'controller' => 'DataSources',
            'action' => 'Home',
          ),
        ),
      ),
      'indicators-home' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/indicators/home',
          'defaults' =>
          array(
            'controller' => 'Indicators',
            'action' => 'Home',
          ),
        ),
      ),
      'datasources-datasource' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/DataSources/Datasource',
          'defaults' =>
          array(
            'controller' => 'DataSources',
            'action' => 'Datasource',
          ),
        ),
      ),
      'bulkexport-home' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/bulkexport/home',
          'defaults' =>
          array(
            'controller' => 'BulkExport',
            'action' => 'Home',
          ),
        ),
      ),
      'bulkexport-csv' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/bulkexport/csv',
          'defaults' =>
          array(
            'controller' => 'BulkExport',
            'action' => 'CSV',
          ),
        ),
      ),
      'bulkexport-download' =>
      array(
        'type' => 'Laminas\\Router\\Http\\Literal',
        'options' =>
        array(
          'route' => '/bulkexport/download',
          'defaults' =>
          array(
            'controller' => 'BulkExport',
            'action' => 'Download',
          ),
        ),
      ),
    ),
  ),
  'vufind' =>
  array(
    'plugin_managers' =>
    array(
      'recorddriver' =>
      array(
        'factories' =>
        array(
          'Oasisbr\\RecordDriver\\SolrDefault' => 'Oasisbr\\RecordDriver\\SolrDefaultFactory',
        ),
        'aliases' =>
        array(
          'VuFind\\RecordDriver\\SolrDefault' => 'Oasisbr\\RecordDriver\\SolrDefault',
          'VuFind\\RecordDriver\\DefaultRecord' => 'Oasisbr\\RecordDriver\\DefaultRecord',
        ),
      ),
    ),
  ),
);
