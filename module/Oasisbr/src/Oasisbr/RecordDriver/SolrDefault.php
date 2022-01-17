<?php

namespace Oasisbr\RecordDriver;

use VuFind\RecordDriver\Response as Response;

class SolrDefault extends \VuFind\RecordDriver\SolrDefault
{


  const SUFFIX_STR = '.fl_str_mv';
  const SUFFIX_TXT = '.fl_txt_mv';



  /**
   * Get all field occurrences
   *
   * @param array $fields to compile and return
   * @return array
   */
  public function getFieldsValues($fields, $suffix = self::SUFFIX_STR)
  {
    $values = [];

    foreach ($fields as $field) {
      if (isset($this->fields[$field . $suffix])) {
        $values = array_merge($values, $this->fields[$field . $suffix]);
      }
    }

    return array_unique($values);
  }

  /**
   * Get single value field value
   *
   * @param array $fields to compile and return
   * @return string
   */
  public function getFieldValue($field, $suffix = self::SUFFIX_STR)
  {
    $value = null;

    if (isset($this->fields[$field . $suffix])) {
      $value = $this->fields[$field . $suffix];

      if (is_array($value))
        $value = $value[0];
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
}
