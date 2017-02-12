<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

/**
 * フォームのHTMLをロードする。
 *
 * XMLからコンバートしてキャッシュする。
 */
class Form extends Base
{

    private $clear = false;
    private $option = [];

    protected function output()
    {
        $p = $this->post;
        $name = $p->get('name');
        $b = \basename($name); // ディレクトリ名無害化
        $cache = \Conecmo\Env::DIR_CACHE . \Conecmo\Cst::FORM_PREFIX . $b . '.json';
        $file_xml = \Conecmo\Env::DIR_APP . \Conecmo\Cst::FORM_PREFIX . $b . '.xml';
        if (!\file_exists($file_xml)) {
            throw new \Conecmo\Exception([$file_xml, 'System' => 'NOT_FOUND']);
        }
        $read_cache = false;
        if (\file_exists($cache)) {
            $c_time = \filemtime($cache);
            $x_time = \filemtime($file_xml);
            $read_cache = ($c_time > $x_time);
        }
        if ($read_cache) {
            return \file_get_contents($cache);
        } else {
            $xml = $this->load($file_xml);
            $html = $this->parse($xml);
            $json = $this->json($html);
            \file_put_contents($cache, $json);
            return $json;
        }
    }

    private function load($file)
    {
        $xml = \simplexml_load_file($file);
        if ($xml === false) {
            $err = \Conecmo\Utl::message('System', 'NO_FORM_DEFINITION');
            foreach (\libxml_get_errors() as $e) {
                $err .= $e->message;
            }
            throw new \Exception($err);
        }
        return $xml;
    }

    private function parse($xml)
    {
        $html = '';

        if ($xml->title) {
            $this->option['title'] = (string) $xml->title;
        }
        if ($xml->height) {
            $this->option['height'] = (int) $xml->height;
        }
        if ($xml->width) {
            $this->option['width'] = (int) $xml->width;
        }
        if ($xml->db->table) {
            $this->option['table'] = (int) $xml->db->table;
        }

        $css = [];
        $css['.form .field'][] = 'margin:' .
                ($xml->fieldMargin ? $xml->fieldMargin . 'px' : '5px');
        $css['.form'][] = 'color:' .
                ($xml->color->fore ? $xml->color->fore : 'black');
        $css['.form'][] = 'background-color:' .
                ($xml->color->back ? $xml->color->back : 'ivory');
        $css['.form'][] = 'font-family:' .
                ($xml->font->family ? $xml->font->family : 'sans-serif');
        $css['.form'][] = 'font-size:' .
                ($xml->font->size ? $xml->font->size . 'px' : '15px');
        $html .= $this->style($css);

        if ($xml->script) {
            $html .= '<script>';
            $html .= $this->hn($xml->script);
            $html .= '</script>';
        }

        foreach ($xml->fields->field as $field) {
            $id = $this->hc($field['id']);
            if ($field->position == 'absolute') {
                $html .= '<label>';
                $html .= $this->htmlAbsoluteLabel($field->label);
                $html .= $this->htmlAbsoluteField($field, $id);
                $html .= '</label>';
            } else {
                $html .= $this->htmlStaticStart($field->float);
                $html .= $this->htmlStaticLabel($field->label);
                $html .= $this->htmlStaticField($field, $id);
                $html .= $this->htmlStaticLabel($field->rightLabel);
                $html .= $this->htmlStaticEnd();
            }
        }

        return $html;
    }

    private function style($css)
    {
        $html = '<style>';
        foreach ($css as $key => $val) {
            $html .= $key . '{' . \implode(';', $val) . ';}';
        }
        $html .= '</style>';
        return $html;
    }

    private function json($html)
    {
        $j = [
            'state' => 'ok',
            'html' => $html,
        ];
        $a = \array_merge($j, $this->option);
        return \json_encode($a, \JSON_UNESCAPED_UNICODE);
    }

    private function hn($s)
    {
        return \htmlspecialchars((string) $s, \ENT_NOQUOTES);
    }

    private function hc($s)
    {
        return \htmlspecialchars((string) $s, \ENT_COMPAT);
    }

    private function htmlAbsoluteField($xml, $id)
    {
        $style = '';
        if ($xml->top) {
            $style .= 'top:' . $this->hc($xml->top) . 'px;';
        }
        if ($xml->left) {
            $style .= 'left:' . $this->hc($xml->left) . 'px;';
        }
        if ($xml->width) {
            $style .= 'width:' . $this->hc($xml->width) . 'px;';
        }
        if ($xml->align) {
            $style .= 'text-align:' . $this->hc($xml->align);
        }
        $title = '';
        if ($xml->tooltip) {
            $title .= ' title="' . $this->hc($xml->tooltip) . '"';
        }
        return '<input name="' . $id .
                '" class="a-field" style="' . $style .
                '"' . $title . '>';
    }

    private function htmlAbsoluteLabel($xml)
    {
        $style = '';
        if ($xml->top) {
            $style .= 'top:' . $this->hc($xml->top) . 'px;';
        }
        if ($xml->left) {
            $style .= 'left:' . $this->hc($xml->left) . 'px;';
        }
        if ($xml->width) {
            $style .= 'width:' . $this->hc($xml->width) . 'px;';
        }
        return '<span class="a-field" style="' . $style .
                '">' . $this->hn($xml->text) . '</span>';
    }

    private function htmlStaticField($xml, $id)
    {
        $style = '';
        if ($xml->width) {
            $style .= 'width:' . $this->hc($xml->width) . 'px;';
        }
        $title = '';
        if ($xml->tooltip) {
            $title .= ' title="' . $this->hc($xml->tooltip) . '"';
        }
        return '<input name="' . $id .
                '" style="' . $style .
                '"' . $title . '>';
    }

    private function htmlStaticLabel($xml)
    {
        if (!$xml) {
            return;
        }
        $style = 'display:inline-block;';
        if ($xml->width) {
            $style .= 'width:' . $this->hc($xml->width) . 'px;';
        }
        return '<span style="' . $style .
                '">' . $this->hn($xml->text) . '</span>';
    }

    private function htmlStaticStart($xml)
    {
        $html = '<div class="field"';
        switch ((string) $xml) {
            case 'left':
                $html .= ' style="float:left;"';
                $this->clear = true;
                break;
            case 'right':
                $html .= ' style="float:right;"';
                $this->clear = true;
                break;
            case 'continue':
                break;
            default:
                if ($this->clear) {
                    $html .= ' style="clear:both;"';
                    $this->clear = false;
                }
                break;
        }
        return $html . '><label>';
    }

    private function htmlStaticEnd()
    {
        return '</label></div>';
    }

}
