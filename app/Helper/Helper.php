<?php

namespace WpabCb\Helper;

if (!defined('ABSPATH')) exit; // Exit if accessed directly

class Helper
{
    public static function get_clean_html($html)
    {
        try {
            $html = html_entity_decode($html);
            $html = preg_replace('/(<(script|style|iframe)\b[^>]*>).*?(<\/\2>)/is', "$1$3", $html);
            $allowed_html = array(
                'br' => array(),
                'strong' => array(),
                'span' => array('class' => array(), 'style' => array()),
                'div' => array('class' => array(), 'style' => array()),
                'p' => array('class' => array(), 'style' => array()),
            );
            // Since v2.5.5
            $allowed_html = apply_filters( 'advanced_woo_discount_rules_allowed_html_elements_and_attributes', $allowed_html);
            return wp_kses($html, $allowed_html);
        } catch (\Exception $e) {
            return '';
        }
    }

    public static function generate_message($format, $args ){
        $format = self::get_clean_html($format);
        if($format == '') return '';
		return str_replace( array_keys( $args ), array_values( $args ), $format );
    }
}
