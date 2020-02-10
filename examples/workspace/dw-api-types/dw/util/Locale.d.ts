

/**
 * Represents a Locale supported by the system.
 */
declare class Locale {
    /**
     * The country/region code for this Locale, which will either be the empty string or an upercase ISO 3166 2-letter code.
     */
    readonly country  :  string

    /**
     * A name for the Locale's country that is appropriate for display to the user, or an empty string if no country has been specified for the Locale. The display country is returned in the language defined for this locale, and not in the language of the session locale.
     */
    readonly displayCountry  :  string

    /**
     * A name for the Locale's language that is appropriate for display to the user, or an empty string if no language has been specified for the Locale. The display language is returned in the language defined for this locale, and not in the language of the session locale.
     */
    readonly displayLanguage  :  string

    /**
     * A name for the Locale that is appropriate for display to the user, or an empty string if no display name has been specified for the Locale. The display name is returned in the language defined for this locale, and not in the language of the session locale.
     */
    readonly displayName  :  string

    /**
     * The String representation of the 'localeID'.
    The identifier of the Locale. Contains a combination of the language and the country key, concatenated by "_", e.g. "en_US". This attribute is the primary key of the class.

    */
    readonly ID  :  string

    /**
     * A three-letter abbreviation for this Locale's country, or an empty string if no country has been specified for the Locale .
     */
    readonly ISO3Country  :  string

    /**
     * A three-letter abbreviation for this Locale's language, or an empty string if no language has been specified for the Locale.
     */
    readonly ISO3Language  :  string

    /**
     * The language code for this Locale, which will either be the empty string or a lowercase ISO 639 code.
     */
    readonly language  :  string

    private constructor();

    /**
     * Returns the country/region code for this Locale, which will either be the empty string or an upercase ISO 3166 2-letter code.
     */
    getCountry() : string

    /**
     * Returns a name for the Locale's country that is appropriate for display to the user, or an empty string if no country has been specified for the Locale.
     */
    getDisplayCountry() : string

    /**
     * Returns a name for the Locale's language that is appropriate for display to the user, or an empty string if no language has been specified for the Locale.
     */
    getDisplayLanguage() : string

    /**
     * Returns a name for the Locale that is appropriate for display to the user, or an empty string if no display name has been specified for the Locale.
     */
    getDisplayName() : string

    /**
     * Returns the String representation of the 'localeID'.
     */
    getID() : string

    /**
     * Returns a three-letter abbreviation for this Locale's country, or an empty string if no country has been specified for the Locale .
     */
    getISO3Country() : string

    /**
     * Returns a three-letter abbreviation for this Locale's language, or an empty string if no language has been specified for the Locale.
     */
    getISO3Language() : string

    /**
     * Returns the language code for this Locale, which will either be the empty string or a lowercase ISO 639 code.
     */
    getLanguage() : string

    /**
     * Returns a Locale instance for the given localeId, or null if no suchLocale could be found.
     * @param localeId
     */
    static getLocale(localeId : string) : Locale

    /**
     * Returns the String representation of the 'localeID'.
     */
    toString() : string


}

export = Locale;
