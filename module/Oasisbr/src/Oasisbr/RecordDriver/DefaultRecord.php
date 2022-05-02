<?php

namespace Oasisbr\RecordDriver;


class DefaultRecord extends \VuFind\RecordDriver\DefaultRecord
{

    /**
     * Get the item's source.
     *
     * @return string
     */
    public function getSource()
    {
        return $this->fields['reponame_str'];
    }

    /**
     * Get an array of strings representing citation formats supported
     * by this record's data (empty if none).  For possible legal values,
     * see /application/themes/root/helpers/Citation.php, getCitation()
     * method.
     *
     * @return array Strings representing citation formats.
     */
    protected function getSupportedCitationFormats()
    {
        return ['APA', 'Chicago', 'MLA'];
    }
}
