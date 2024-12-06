<?php

namespace Oasisbr\RecordDriver;

use VuFind\RecordDriver\Response as Response;

class SolrDefault extends \VuFind\RecordDriver\SolrDefault
{


  const SUFFIX_STR = '.fl_str_mv';
  const SUFFIX_TXT = '.fl_txt_mv';



  public function getFieldsValues($fields)
  {
    $values = [];

    foreach ($fields as $field) {
      if (isset($this->fields[$field])) {
        $field_value = $this->fields[$field];
        if (!is_array($field_value))
          $field_value = array($field_value);

        $values = array_merge($values, $field_value);
      }
    }

    return array_unique($values);
  }


  public function getFieldValue($field)
  {
    $value = null;
    $onlyField = array($field);

    $value = $this->getFieldsValues($onlyField);

    if (is_array($value)) {
      if (count($value) > 0)

        $value = $value[0];
      else
        return "";
    }

    return $value;
  }


  /**
   * Deduplicate author information into associative array with main/corporate/
   * secondary keys.
   *
   * @param array $dataFields An array of extra data fields to retrieve (see
   * getAuthorDataFields)
   *
   * @return array
   */
  public function getDeduplicatedAuthors($dataFields = ['profile'])
  {
    return parent::getDeduplicatedAuthors($dataFields);
  }

  /**
   ** AUTHORS Data
   */

  /**
   *
   * @return array
   */
  public function getPrimaryAuthorsProfiles()
  {
    return $this->getFieldsValues(['dc.contributor.authorLattes']);
  }


  /**
   ** CONTRIBUTORS Data
   */

  /**
   * Main function called from RecordDataFormaterFactory, calls functions
   * with pattern get[XXX]Authors and get[XXX]Authors[YYY]s
   * where XXX is on of advisor, coadvisor, referee
   * and YYY is a datafile: ie: profile
   *
   * @param array $dataFields An array of extra data fields to retrieve (see
   * getAuthorDataFields)
   *
   * @return array
   */
  public function getContributors($dataFields = ['profile'])
  {
    $authors = [];
    foreach (['advisor', 'coadvisor', 'referee'] as $type) {
      $authors[$type] = $this->getAuthorDataFields($type, $dataFields);
    }
    return $authors;
  }


  /**
   * Advisors
   */
  public function getAdvisorAuthors()
  {
    return $this->getFieldsValues(['dc.contributor.advisor1', 'dc.contributor.advisor2']);
  }
  public function getAdvisorAuthorsProfiles()
  {
    return $this->getFieldsValues(['dc.contributor.advisor1Lattes', 'dc.contributor.advisor2Lattes']);
  }

  /**
   * Coadvisor
   */
  public function getCoadvisorAuthors()
  {
    return $this->getFieldsValues(['dc.contributor.advisor-co1', 'dc.contributor.advisor-co2']);
  }
  public function getCoadvisorAuthorsProfiles()
  {
    return $this->getFieldsValues(['dc.contributor.advisor-co1Lattes', 'dc.contributor.advisor-co2Lattes']);
  }

  /**
   * Get the item's source.
   *
   * @return string
   */
  public function getSource()
  {
    // Add essa verificação pq estava dando erro para exibir itens removidos do solr (esses itens vem da api de persistência de ids)
    return isset($this->fields['reponame_str']) ? $this->fields['reponame_str'] : '';
  }

  /**
   * Get the item's dark id.
   *
   * @return string
   */
  public function getDarkID()
  {
    // Add essa verificação pq estava dando erro para exibir itens removidos do solr (esses itens vem da api de persistência de ids)
    return isset($this->fields['dc.identifier.dark.fl_str_mv']) ? $this->fields['dc.identifier.dark.fl_str_mv'][0] : '';
  }

  /**
   * Referee
   */
  public function getRefereeAuthors()
  {
    return $this->getFieldsValues(['dc.contributor.referee1', 'dc.contributor.referee2', 'dc.contributor.referee3', 'dc.contributor.referee4', 'dc.contributor.referee5']);
  }
  public function getRefereeAuthorsProfiles()
  {
    return $this->getFieldsValues(['dc.contributor.referee1Lattes', 'dc.contributor.referee2Lattes', 'dc.contributor.referee3Lattes', 'dc.contributor.referee4Lattes', 'dc.contributor.referee5Lattes']);
  }


  /**
   *  SUBJECTS
   **/

  /**
   * Get all subject headings associated with this record.  Each heading is
   * returned as an array of chunks, increasing from least specific to most
   * specific.
   *
   * @param bool $extended Whether to return a keyed array with the following
   * keys:
   * - heading: the actual subject heading chunks
   * - type: heading type
   * - source: source vocabulary
   *
   * @return array
   */
  public function getSubjectsByField($field, $type, $source, $extended = false)
  {
    $headings =  $this->getFieldsValues([$field]);

    // The Solr index doesn't currently store subject headings in a broken-down
    // format, so we'll just send each value as a single chunk.  Other record
    // drivers (i.e. MARC) can offer this data in a more granular format.
    $callback = function ($i) use ($extended) {
      return $extended
        ? ['heading' => [$i], 'type' => $type, 'source' => $source]
        : [$i];
    };
    return array_map($callback, array_unique($headings));
  }

  public function getAllSubjectHeadings($extended = false)
  {
    $headings = [];

    $headings = array_merge($headings,  $this->getSubjectsByField("dc.subject.cnpq", "cnpq", "cnpq", $extended));
    $headings = array_merge($headings,  $this->getSubjectsByField("dc.subject.eng", "original", "eng", $extended));
    $headings = array_merge($headings,  $this->getSubjectsByField("dc.subject.spa", "original", "spa", $extended));
    $headings = array_merge($headings,  $this->getSubjectsByField("dc.subject.por", "original", "por", $extended));

    return $headings;
  }

  public function getCNPQSubjects()
  {
    return  $this->getSubjectsByField("dc.subject.cnpq", "cnpq", "cnpq");
  }

  public function getEngSubjects()
  {
    return  $this->getSubjectsByField("dc.subject.eng", "original", "eng");
  }

  public function getSpaSubjects()
  {
    return  $this->getSubjectsByField("dc.subject.spa", "original", "spa");
  }

  public function getPorSubjects()
  {
    return  $this->getSubjectsByField("dc.subject.por", "original", "por");
  }


  /**
   *  Published
   **/
  /**
   * Get an array of publication detail lines combining information from
   * getPublicationDates(), getPublishers() and getPlacesOfPublication().
   *
   * @return array
   */
  public function getPublicationDetailsByPublishers($names)
  {

    $i = 0;
    $retval = [];
    while (isset($names[$i])) {
      // Build objects to represent each set of data; these will
      // transform seamlessly into strings in the view layer.
      $retval[] = new Response\PublicationDetails(
        '',
        $names[$i],
        ''
      );
      $i++;
    }

    return $retval;
  }



  public function getRootPublishers()
  {
    return $this->getPublicationDetailsByPublishers($this->getFieldsValues(['dc.publisher.none']));
  }

  public function getProgramPublishers()
  {
    return  $this->getPublicationDetailsByPublishers($this->getFieldsValues(['dc.publisher.program']));
  }

  public function getDepartmentPublishers()
  {
    return $this->getPublicationDetailsByPublishers($this->getFieldsValues(['dc.publisher.department']));
  }


  /**
   * DESCRIPTION
   *
   */
  public function getAbstractPor()
  {
    return $this->getFieldsValues(['dc.description.abstract.por'], self::SUFFIX_TXT);
  }

  public function getAbstractEng()
  {
    return $this->getFieldsValues(['dc.description.abstract.eng'], self::SUFFIX_TXT);
  }

  public function getAbstracSpa()
  {
    return $this->getFieldsValues(['dc.description.abstract.spa'], self::SUFFIX_TXT);
  }

  public function getCitation()
  {
    return $this->getFieldsValues(['dc.identifier.citation']);
  }

  /**
   * Access Level
   **/
  public function getAccessLevel()
  {
    return $this->getFieldValue('eu_rights', '_str_mv');
  }

  public function getURLsArray()
  {
    // If non-empty, map internal URL array to expected return format;
    // otherwise, return empty array:
    if (isset($this->fields['url']) && is_array($this->fields['url'])) {

      return $this->fields['url'];
    }
    return [];
  }

  // LA Referencia Estatísticas 
  public function getIdentifierOAI()
  {
    return $this->getFieldValue("oai_identifier_str");
  }
  // LA Referencia Estatísticas 
  public function getRepositoryID()
  {
    return $this->getFieldValue("repository_id_str");
  }

  // Campos adicionados para export na API para CAPES
  public function getNetworkName()
  {
    return $this->getFieldValue("network_name_str");
  }
  public function getNetworkAcronym()
  {
    return $this->getFieldValue("network_acronym_str");
  }
  public function getDescription()
  {
    return $this->getFieldValue("description");
  }
  public function getPublishDate()
  {
    return $this->getFieldValue("publishDate");
  }
  public function getTopic()
  {
    return $this->getFieldValue("topic");
  }
  public function getInstitution()
  {
    return $this->getFieldValue("institution");
  }
  public function getInstName()
  {
    return $this->getFieldValue("instname_str");
  }
  public function getPublisherProgram()
  {
    return $this->getFieldValue("dc.publisher.program.fl_str_mv");
  }
  public function getAdvisor()
  {
    return $this->getFieldValue("dc.contributor.advisor1.fl_str_mv");
  }
  public function getRights()
  {
    return $this->getFieldValue("eu_rights_str_mv");
  }
}
